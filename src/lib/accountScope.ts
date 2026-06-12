export type AccountScope = "personal" | "pro" | "family";

export function parseAccountScope(raw: string | null | undefined): AccountScope {
  if (raw === "pro" || raw === "family" || raw === "personal") return raw;
  return "personal";
}
