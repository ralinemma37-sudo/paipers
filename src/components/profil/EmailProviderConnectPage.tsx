"use client";

/**
 * Écran connexion email (Gmail / Outlook) — réf. profil/gmail.tsx & outlook.tsx
 */

import { useCallback, useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { useNavSpace } from "@/components/NavSpaceProvider";
import type { AccountScope } from "@/lib/accountScope";
import {
  deleteEmailConnection,
  loadEmailConnection,
  type EmailProvider,
} from "@/lib/externalConnections";
import { gmailConnectUrl, outlookConnectUrl } from "@/lib/oauthConnectUrls";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Props = {
  provider: EmailProvider;
  title: string;
  subtitlePersonal: string;
  subtitlePro: string;
};

export default function EmailProviderConnectPage({
  provider,
  title,
  subtitlePersonal,
  subtitlePro,
}: Props) {
  const { showProTabs } = useNavSpace();
  const scope: AccountScope = showProTabs ? "pro" : "personal";
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setLoading(false);
      return;
    }
    setUserId(auth.user.id);
    const row = await loadEmailConnection(auth.user.id, provider, scope);
    setEmail(row?.account_email ?? null);
    setLoading(false);
  }, [provider, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  const handleConnect = () => {
    if (!userId) return;
    const url =
      provider === "gmail"
        ? gmailConnectUrl(userId, scope)
        : outlookConnectUrl(userId, scope);
    window.location.href = url;
  };

  const handleDisconnect = async () => {
    if (!userId || busy) return;
    const ok = window.confirm(
      provider === "gmail"
        ? "Déconnecter Gmail ?\n\nPaipers n’importera plus les pièces jointes de ce compte."
        : "Déconnecter Outlook ?\n\nPaipers n’importera plus les pièces jointes de ce compte.",
    );
    if (!ok) return;
    setBusy(true);
    setMsg("");
    const { error } = await deleteEmailConnection(userId, provider, scope);
    if (error) setMsg(`Erreur : ${error}`);
    else setEmail(null);
    setBusy(false);
  };

  const connected = Boolean(email);

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 880 }}
        >
          <ProfilSubpageHeader
            title={title}
            subtitle={showProTabs ? subtitlePro : subtitlePersonal}
            backHref="/profil/emails"
          />

          {loading ? (
            <p className="paipers-text-muted">Chargement…</p>
          ) : (
            <div className="paipers-elevated-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    color: connected ? "#15803d" : PAIPERS_COLORS.neutral,
                    margin: 0,
                  }}
                >
                  {connected ? "Connecté" : "Non connecté"}
                </p>
                {connected ? (
                  <p style={{ marginTop: 8, fontWeight: 700, marginBottom: 0 }}>
                    {email}
                  </p>
                ) : (
                  <p className="paipers-text-muted" style={{ marginTop: 8, marginBottom: 0 }}>
                    Aucun compte {title} relié pour cet espace.
                  </p>
                )}
              </div>

              {msg ? (
                <p style={{ color: "#B91C1C", fontSize: 13, margin: 0 }}>{msg}</p>
              ) : null}

              {connected ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDisconnect()}
                  style={{
                    padding: "14px 16px",
                    borderRadius: PAIPERS_RADIUS.button,
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                    background: "#fff",
                    fontWeight: 800,
                    cursor: busy ? "wait" : "pointer",
                  }}
                >
                  {busy ? "…" : `Déconnecter ${title}`}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnect}
                  style={{
                    padding: "14px 16px",
                    borderRadius: PAIPERS_RADIUS.button,
                    border: "none",
                    background: PAIPERS_COLORS.navy,
                    color: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Connecter {title}
                </button>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </Protected>
  );
}
