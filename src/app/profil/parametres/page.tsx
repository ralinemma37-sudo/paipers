"use client";

/**
 * Paramètres — réf. paipers-mobile/app/(tabs)/profil/parametres.tsx
 * Mode sombre (clé `theme` alignée ThemeInit) · auto_import · delete-account Edge Function.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { userMessageForFunctionsInvokeError } from "@/lib/assistantScopeGuard";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function ParametresPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [autoImport, setAutoImport] = useState(true);
  const [userId, setUserId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const dark = stored === "dark";
      setDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark);
      if (!stored) {
        localStorage.setItem("theme", "light");
      }
    } catch {
      /* ignore */
    }

    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      setUserId(auth.user.id);
      const { data } = await supabase
        .from("profiles")
        .select("metadata")
        .eq("id", auth.user.id)
        .maybeSingle();
      const metadata = (data?.metadata as Record<string, unknown> | null) ?? null;
      if (metadata?.auto_import !== undefined) {
        setAutoImport(Boolean(metadata.auto_import));
      }
    })();
  }, []);

  const setTheme = (dark: boolean) => {
    setDarkMode(dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      /* ignore */
    }
  };

  const persistAutoImport = async (value: boolean) => {
    if (!userId) return;
    const { data: existing } = await supabase
      .from("profiles")
      .select("metadata")
      .eq("id", userId)
      .maybeSingle();
    const current =
      ((existing?.metadata as Record<string, unknown>) || {}) as Record<string, unknown>;
    await supabase
      .from("profiles")
      .update({
        metadata: {
          ...current,
          auto_import: value,
        },
      })
      .eq("id", userId);
  };

  const deleteAccount = async () => {
    if (!userId || deleting) return;
    const ok = window.confirm(
      "Supprimer le compte ?\n\nTon compte et toutes les données associées (documents, dossiers, connexions email, profil, etc.) seront effacés de façon définitive. Tu ne pourras pas revenir en arrière.",
    );
    if (!ok) return;

    setDeleting(true);
    setMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: {},
      });
      if (error) {
        setMsg(userMessageForFunctionsInvokeError(error));
        setDeleting(false);
        return;
      }
      const body = data as { success?: boolean; error?: string } | null;
      if (!body?.success) {
        setMsg(body?.error ?? "La suppression a échoué.");
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Une erreur est survenue.");
      setDeleting(false);
    }
  };

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 960 }}
        >
          <ProfilSubpageHeader
            title="Paramètres"
            subtitle="Réglages de l’application."
          />

          <div className="paipers-elevated-card" style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>Mode sombre</p>
                <p className="paipers-text-muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
                  Active un thème sombre sur toute l&apos;application.
                </p>
              </div>
              <label style={{ display: "inline-flex", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setTheme(e.target.checked)}
                  style={{ width: 44, height: 24 }}
                  aria-label="Mode sombre"
                />
              </label>
            </div>
          </div>

          <div className="paipers-elevated-card" style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <p style={{ fontWeight: 800, fontSize: 16, margin: 0 }}>
                  Import automatique des documents
                </p>
                <p className="paipers-text-muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
                  Importe automatiquement les pièces jointes depuis tes connexions email.
                </p>
              </div>
              <label style={{ display: "inline-flex", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={autoImport}
                  onChange={(e) => {
                    const v = e.target.checked;
                    setAutoImport(v);
                    void persistAutoImport(v);
                  }}
                  style={{ width: 44, height: 24 }}
                  aria-label="Import automatique des documents"
                />
              </label>
            </div>
          </div>

          <p
            className="paipers-text-muted"
            style={{
              marginTop: 20,
              fontSize: 13,
              lineHeight: "19px",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            La suppression du compte est irréversible : tu perdras l’accès à tous tes documents,
            dossiers et connexions email liés à Paipers.
          </p>

          <button
            type="button"
            disabled={deleting || !userId}
            onClick={() => void deleteAccount()}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: PAIPERS_RADIUS.button,
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              color: "#B91C1C",
              fontWeight: 800,
              cursor: deleting ? "wait" : "pointer",
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? "Suppression…" : "Supprimer mon compte"}
          </button>

          {msg ? (
            <p role="alert" style={{ color: "#B91C1C", marginTop: 12, fontSize: 14 }}>
              {msg}
            </p>
          ) : null}
        </div>
      </AppShell>
    </Protected>
  );
}
