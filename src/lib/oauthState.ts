import { parseAccountScope, type AccountScope } from "./accountScope";

export type OAuthStatePayload = {
  user_id: string;
  platform: string;
  account_scope: AccountScope;
  t: number;
};

export function encodeOAuthState(payload: Omit<OAuthStatePayload, "t"> & { t?: number }): string {
  const full: OAuthStatePayload = {
    ...payload,
    account_scope: parseAccountScope(payload.account_scope),
    platform: payload.platform || "mobile",
    t: payload.t ?? Date.now(),
  };
  return Buffer.from(JSON.stringify(full), "utf8").toString("base64url");
}

export function decodeOAuthState(stateB64: string): OAuthStatePayload | null {
  try {
    const stateJson = Buffer.from(stateB64, "base64url").toString("utf8");
    const raw = JSON.parse(stateJson) as Partial<OAuthStatePayload>;
    if (!raw.user_id || typeof raw.user_id !== "string") return null;
    return {
      user_id: raw.user_id,
      platform: typeof raw.platform === "string" ? raw.platform : "mobile",
      account_scope: parseAccountScope(raw.account_scope),
      t: typeof raw.t === "number" ? raw.t : Date.now(),
    };
  } catch {
    return null;
  }
}
