/**
 * Email double opt-in waitlist via Resend HTTP API (pas de dépendance npm).
 * Design / contenu uniquement — pas de logique métier waitlist.
 */

const WAITLIST_PUBLIC_ORIGIN =
  (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://paipers.fr")
    .trim()
    .replace(/\/$/, "") || "https://paipers.fr";

const LOGO_PATH = "/brand/splash-logo-light.png";
const PRIVACY_URL = `${WAITLIST_PUBLIC_ORIGIN}/legal/politique-confidentialite`;

export const WAITLIST_CONFIRM_EMAIL_SUBJECT =
  "Confirme ton inscription à la liste d’attente Paipers";

export const WAITLIST_CONFIRM_EMAIL_PREHEADER =
  "Une dernière étape pour réserver ta place parmi les premiers utilisateurs de Paipers.";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absolutePublicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${WAITLIST_PUBLIC_ORIGIN}${normalized}`;
}

export function buildWaitlistConfirmEmailHtml(params: {
  firstName?: string | null;
  confirmUrl: string;
}): string {
  const rawName = params.firstName?.trim() || "";
  const hello = rawName ? `Bonjour ${escapeHtml(rawName)},` : "Bonjour,";
  const confirmUrl = params.confirmUrl;
  const logoUrl = absolutePublicAsset(LOGO_PATH);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(WAITLIST_CONFIRM_EMAIL_SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Préheader -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(WAITLIST_CONFIRM_EMAIL_PREHEADER)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F4F7FB;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:20px;border:1px solid #E5EAF2;overflow:hidden;">
          <!-- Bandeau pastel -->
          <tr>
            <td style="height:6px;line-height:6px;font-size:0;background:linear-gradient(90deg,#ACE4FF,#F7C4E8,#FFECC9);">&nbsp;</td>
          </tr>
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:28px 28px 8px;">
              <img
                src="${logoUrl}"
                alt="Paipers"
                width="88"
                height="88"
                style="display:block;width:88px;height:auto;border:0;outline:none;text-decoration:none;border-radius:16px;"
              />
            </td>
          </tr>
          <!-- Corps -->
          <tr>
            <td style="padding:12px 28px 8px;">
              <p style="margin:0 0 16px;font-size:17px;line-height:1.5;color:#1A2B4A;font-weight:700;">
                ${hello}
              </p>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#1A2B4A;font-weight:700;">
                Bienvenue parmi les premiers à suivre l’aventure Paipers &#127881;
              </p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3D4F6F;">
                Tu viens de réserver ta place pour découvrir ton futur copilote administratif intelligent avant son ouverture officielle.
              </p>
              <p style="margin:0 0 26px;font-size:15px;line-height:1.6;color:#3D4F6F;">
                Confirme maintenant ton adresse email pour finaliser ton inscription à la liste d’attente.
              </p>
              <!-- Bouton -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 22px;">
                <tr>
                  <td align="center" style="border-radius:999px;background:linear-gradient(135deg,#ACE4FF,#F7C4E8);">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(confirmUrl)}" style="height:52px;v-text-anchor:middle;width:260px;" arcsize="50%" stroke="f" fillcolor="#ACE4FF">
                      <w:anchorlock/>
                      <center style="color:#0B1220;font-family:sans-serif;font-size:15px;font-weight:bold;">Confirmer mon inscription</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-- -->
                    <a href="${escapeHtml(confirmUrl)}" style="display:inline-block;padding:16px 28px;font-size:15px;line-height:1.2;font-weight:800;color:#0B1220;text-decoration:none;border-radius:999px;min-width:200px;text-align:center;">
                      Confirmer mon inscription
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#3D4F6F;">
                Une fois ton inscription confirmée, tu seras informé(e) en priorité de l’ouverture de Paipers et des étapes importantes du projet.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;background:#F4F7FB;border-radius:14px;border:1px solid #E5EAF2;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#1A2B4A;">
                      Pourquoi Paipers ?
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.55;color:#3D4F6F;">
                      Parce que gérer son administratif devrait prendre quelques minutes, pas plusieurs heures. Paipers a pour ambition de centraliser tes documents, surveiller les échéances importantes et t’aider à agir au bon moment.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#5B6B86;">
                Le bouton ne fonctionne pas ?
                <a href="${escapeHtml(confirmUrl)}" style="color:#1A2B4A;font-weight:700;text-decoration:underline;">
                  Confirme ton inscription ici
                </a>.
              </p>
              <p style="margin:18px 0 0;font-size:15px;line-height:1.55;color:#1A2B4A;">
                À bientôt,<br />
                <strong>L’équipe Paipers</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:22px 28px 26px;border-top:1px solid #EEF2F7;">
              <p style="margin:0 0 10px;font-size:11px;line-height:1.5;color:#7B879C;">
                Tu reçois cet email car une inscription à la liste d’attente de Paipers a été demandée avec cette adresse sur paipers.fr.
              </p>
              <p style="margin:0 0 10px;font-size:11px;line-height:1.5;color:#7B879C;">
                <a href="${PRIVACY_URL}" style="color:#5B6B86;text-decoration:underline;">
                  Politique de confidentialité
                </a>
              </p>
              <p style="margin:0;font-size:10px;line-height:1.45;color:#9AA6B8;word-break:break-all;">
                Tu peux également copier cette adresse dans ton navigateur :<br />
                <a href="${escapeHtml(confirmUrl)}" style="color:#9AA6B8;text-decoration:underline;word-break:break-all;">
                  ${escapeHtml(confirmUrl)}
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWaitlistConfirmEmail(params: {
  to: string;
  firstName?: string | null;
  confirmUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.WAITLIST_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "";

  if (!apiKey || !from) {
    return {
      ok: false,
      error: "email_not_configured",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: WAITLIST_CONFIRM_EMAIL_SUBJECT,
      html: buildWaitlistConfirmEmailHtml({
        firstName: params.firstName,
        confirmUrl: params.confirmUrl,
      }),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `resend_http_${res.status}` };
  }

  return { ok: true };
}
