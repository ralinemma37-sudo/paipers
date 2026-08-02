/**
 * Liens et textes de partage organique Paipers (aucune donnée personnelle).
 */

export const WAITLIST_SHARE_URL = "https://paipers.fr/#waitlist";

export const WAITLIST_SHARE_TITLE =
  "Paipers — Le copilote administratif intelligent";

export const WAITLIST_SHARE_TEXT =
  "Découvre Paipers et rejoins sa liste d’attente.";

export const WAITLIST_SHARE_MESSAGE =
  "Je viens de rejoindre la liste d’attente de Paipers, le futur copilote administratif intelligent. Tu peux découvrir le projet ici : https://paipers.fr/#waitlist";

export function whatsappShareUrl(message = WAITLIST_SHARE_MESSAGE): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function linkedInShareUrl(url = WAITLIST_SHARE_URL): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function emailShareHref(params?: {
  subject?: string;
  body?: string;
}): string {
  const subject = params?.subject ?? "Découvre Paipers";
  const body =
    params?.body ??
    `Je viens de rejoindre la liste d’attente de Paipers, le futur copilote administratif intelligent.\n\nTu peux découvrir le projet ici :\n${WAITLIST_SHARE_URL}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback below */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeSharePaipers(): Promise<
  "shared" | "cancelled" | "unavailable" | "error"
> {
  if (!canUseNativeShare()) return "unavailable";
  try {
    await navigator.share({
      title: WAITLIST_SHARE_TITLE,
      text: WAITLIST_SHARE_TEXT,
      url: WAITLIST_SHARE_URL,
    });
    return "shared";
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    return "error";
  }
}
