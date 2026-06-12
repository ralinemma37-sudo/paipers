export function oauthSuccessHtml(providerLabel: string): string {
  return (
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/>` +
    `<title>${providerLabel}</title></head><body style="font-family:system-ui;padding:24px;text-align:center">` +
    `<p>${providerLabel} est connecté à Paipers.</p>` +
    `<p style="color:#666;font-size:14px">Tu peux fermer cette page et revenir dans l’app.</p>` +
    `</body></html>`
  );
}
