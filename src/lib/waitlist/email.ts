/**
 * Email double opt-in waitlist via Resend HTTP API (pas de dépendance npm).
 */

export function buildWaitlistConfirmEmailHtml(params: {
  firstName?: string | null;
  confirmUrl: string;
}): string {
  const hello = params.firstName?.trim()
    ? `Bonjour ${params.firstName.trim()},`
    : "Bonjour,";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0B1220;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0B1220;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#121a2b;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr><td style="padding:28px 28px 8px;text-align:center;">
          <div style="display:inline-block;background:#fff;border-radius:10px;padding:8px 14px;">
            <span style="font-size:18px;font-weight:800;color:#1A2B4A;letter-spacing:-0.02em;">Paipers</span>
          </div>
        </td></tr>
        <tr><td style="padding:16px 28px 8px;">
          <p style="margin:0 0 12px;font-size:16px;line-height:1.5;color:#F8FAFC;">${hello}</p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#CBD5E1;">
            Merci pour ton intérêt.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:#CBD5E1;">
            Clique sur le bouton ci-dessous afin de confirmer ton inscription à la liste d’attente.
          </p>
          <p style="margin:0 0 28px;text-align:center;">
            <a href="${params.confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#ACE4FF,#F7C4E8);color:#0B1220;text-decoration:none;font-weight:800;font-size:15px;padding:14px 22px;border-radius:999px;">
              Confirmer mon inscription
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#94A3B8;">
            Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br/>
            <a href="${params.confirmUrl}" style="color:#ACE4FF;word-break:break-all;">${params.confirmUrl}</a>
          </p>
          <p style="margin:24px 0 0;font-size:15px;line-height:1.5;color:#F8FAFC;">
            À bientôt,<br/>L’équipe Paipers
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px 24px;">
          <p style="margin:0;font-size:11px;line-height:1.4;color:#64748B;">
            Tu reçois cet email car une inscription a été demandée avec cette adresse sur paipers.app.
          </p>
        </td></tr>
      </table>
    </td></tr>
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
      subject: "Confirme ton inscription à la liste d’attente Paipers",
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
