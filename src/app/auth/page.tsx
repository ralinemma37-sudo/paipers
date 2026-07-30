"use client";

/**
 * Ancienne page Auth UI (anglais / thème sombre) → redirection vers /login.
 * Conserve le paramètre ?next= pour Protected.
 */

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PAIPERS_PALETTES } from "@/lib/paipersTheme";

function AuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next");
    const q = next ? `?next=${encodeURIComponent(next)}` : "";
    router.replace(`/login${q}`);
  }, [router, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ color: PAIPERS_PALETTES.light.textMuted }}
    >
      Chargement…
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ color: PAIPERS_PALETTES.light.textMuted }}
        >
          Chargement…
        </div>
      }
    >
      <AuthRedirect />
    </Suspense>
  );
}
