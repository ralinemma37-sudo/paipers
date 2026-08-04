import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAdminWaitlistPath,
  isPrivateAppPath,
  isWaitlistAdminEmailFromEnv,
} from "@/lib/authRoutePolicy";

/**
 * Protection serveur des routes app + refresh session cookies (Next.js 16 Proxy).
 * Runtime Node.js (convention proxy) — compatible @supabase/ssr.
 * Ne bloque pas : /, login, waitlist, APIs waitlist publiques, auth callbacks, assets.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    // Sans config : ne pas casser le site public ; les pages privées restent protégées côté client.
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Rafraîchit la session (obligatoire avant toute décision d’accès).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPrivateAppPath(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminWaitlistPath(pathname)) {
      const email = user.email ?? null;
      if (!isWaitlistAdminEmailFromEnv(email)) {
        const denied = request.nextUrl.clone();
        denied.pathname = "/assistant";
        denied.searchParams.set("admin", "denied");
        return NextResponse.redirect(denied);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Exclut assets Next, images, favicon, fichiers publics courants.
     * Les APIs waitlist publiques ne sont pas dans les préfixes privés.
     */
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?)$).*)",
  ],
};
