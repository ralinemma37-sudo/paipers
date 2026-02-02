import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user_id = body?.user_id as string | undefined;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 }
      );
    }

    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const email = (token as any)?.googleEmail as string | undefined;
    const access_token = (token as any)?.accessToken as string | undefined;
    const refresh_token = (token as any)?.refreshToken as string | undefined;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "No googleEmail in session" },
        { status: 401 }
      );
    }

    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { success: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // Payload minimal sûr (pas de updated_at)
    const payload: any = { email, user_id };
    if (access_token) payload.access_token = access_token;
    if (refresh_token) payload.refresh_token = refresh_token;

    // 1) Est-ce qu’une ligne existe déjà pour cet email ?
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("gmail_connections")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json(
        { success: false, error: findErr.message },
        { status: 500 }
      );
    }

    // 2) Si existe -> UPDATE ; sinon -> INSERT
    if (existing?.id) {
      const { error: updateErr } = await supabaseAdmin
        .from("gmail_connections")
        .update(payload)
        .eq("id", existing.id);

      if (updateErr) {
        return NextResponse.json(
          { success: false, error: updateErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, mode: "updated" });
    } else {
      const { error: insertErr } = await supabaseAdmin
        .from("gmail_connections")
        .insert(payload);

      if (insertErr) {
        return NextResponse.json(
          { success: false, error: insertErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, mode: "inserted" });
    }
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

