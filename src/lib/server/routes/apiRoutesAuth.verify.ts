/**
 * SEC-1 — Tests des 8 routes API sécurisées.
 * Exécution : tsx src/lib/server/routes/apiRoutesAuth.verify.ts
 *
 * Les VRAIS gestionnaires sont exécutés avec de vraies requêtes `Request` et des dépendances SIMULÉES
 * qui enregistrent chaque appel (base, stockage, Gmail, IA, quota). Aucun appel réseau.
 * Ces tests prouvent le comportement du code ; ils ne prouvent pas la sécurité d'un déploiement réel.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  parseQuotaRows,
  safeEqualSecret,
  type AuthDeps,
  type AuthenticatedUser,
  type QuotaDeps,
  type QuotaVerdict,
} from "@/lib/server/apiAuth";
import type { AiRouteDeps } from "@/lib/server/routes/aiRouteDeps";
import { handleClassifyDocument } from "@/lib/server/routes/classifyDocumentRoute";
import { handleGenerateDocument } from "@/lib/server/routes/generateDocumentRoute";
import { handleGmailDownloadAttachment } from "@/lib/server/routes/gmailDownloadAttachmentRoute";
import { handleGmailScan } from "@/lib/server/routes/gmailScanRoute";
import { handleGoogleSaveConnection } from "@/lib/server/routes/googleSaveConnectionRoute";
import { handleProcessNewDocument, WEBHOOK_SECRET_HEADER } from "@/lib/server/routes/processNewDocumentRoute";
import { handleReadPdf } from "@/lib/server/routes/readPdfRoute";
import { handleRename } from "@/lib/server/routes/renameRoute";

// ---------------------------------------------------------------------------
// Données synthétiques
// ---------------------------------------------------------------------------
const U1: AuthenticatedUser = { userId: "00000000-0000-4000-8000-0000000000a1", email: "u1@qa-a.invalid" };
const U2_ID = "00000000-0000-4000-8000-0000000000b2";
const DOC_U1 = "00000000-0000-4000-8000-0000000000d1";
const DOC_U2 = "00000000-0000-4000-8000-0000000000d2";
const VALID_JWT = "valid.jwt.token";
const EXPIRED_JWT = "expired.jwt.token";
const OTHER_JWT = "other.jwt.token";
const LEAK = "SECRET_INTERNAL_DETAIL_42";
const WEBHOOK_SECRET = "test-webhook-secret-not-real";

// ---------------------------------------------------------------------------
// Monde simulé : chaque effet est enregistré
// ---------------------------------------------------------------------------
type Query = {
  table: string;
  op: "select" | "update" | "insert" | null;
  columns?: string;
  filters: Array<[string, unknown]>;
  payload?: unknown;
  terminal?: string;
};
type Effects = {
  verifyToken: number;
  verifyCookie: number;
  queries: Query[];
  storage: Array<{ bucket: string; op: string; path: string }>;
  rpc: Array<{ name: string; args: unknown }>;
  fetch: string[];
  ai: number;
  classify: number;
  quota: number;
  googleToken: number;
  extract: number;
};

function newEffects(): Effects {
  return {
    verifyToken: 0, verifyCookie: 0, queries: [], storage: [], rpc: [], fetch: [],
    ai: 0, classify: 0, quota: 0, googleToken: 0, extract: 0,
  };
}

type DbScript = (q: Query) => { data?: unknown; error?: unknown };
type StorageScript = (op: string, path: string) => { data?: unknown; error?: unknown };

function fakeSupabase(fx: Effects, db: DbScript, storage: StorageScript = () => ({ data: null, error: null })): SupabaseClient {
  const run = (q: Query) => {
    fx.queries.push(q);
    const r = db(q);
    return { data: r.data ?? null, error: r.error ?? null };
  };
  const client = {
    from(table: string) {
      const q: Query = { table, op: null, filters: [] };
      const b = {
        select(cols?: string) { if (!q.op) q.op = "select"; q.columns = cols; return b; },
        update(p: unknown) { q.op = "update"; q.payload = p; return b; },
        insert(p: unknown) { q.op = "insert"; q.payload = p; return b; },
        eq(k: string, v: unknown) { q.filters.push([k, v]); return b; },
        limit(n: number) { q.terminal = `limit:${n}`; return b; },
        maybeSingle() { q.terminal = "maybeSingle"; return Promise.resolve(run(q)); },
        single() { q.terminal = "single"; return Promise.resolve(run(q)); },
        then(res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) { return Promise.resolve(run(q)).then(res, rej); },
      };
      return b;
    },
    storage: {
      from(bucket: string) {
        return {
          download(path: string) { fx.storage.push({ bucket, op: "download", path }); return Promise.resolve(storage("download", path)); },
          upload(path: string) { fx.storage.push({ bucket, op: "upload", path }); return Promise.resolve(storage("upload", path)); },
        };
      },
    },
    rpc(name: string, args: unknown) { fx.rpc.push({ name, args }); return Promise.resolve({ data: null, error: null }); },
  };
  return client as unknown as SupabaseClient;
}

function fakeAuth(fx: Effects, opts: { cookieUser?: AuthenticatedUser | null } = {}): AuthDeps {
  return {
    async verifyAccessToken(token: string) {
      fx.verifyToken += 1;
      if (token === VALID_JWT) return U1;
      if (token === OTHER_JWT) return { userId: U2_ID, email: "u2@qa-a.invalid" };
      if (token === EXPIRED_JWT) throw new Error("JWT expired");
      return null;
    },
    async verifyCookieSession() {
      fx.verifyCookie += 1;
      return opts.cookieUser ?? null;
    },
  };
}

type QuotaMode = "allow" | "deny" | "unavailable" | "throw" | { allowFirst: number };
function fakeQuota(fx: Effects, mode: QuotaMode = "allow"): QuotaDeps {
  let n = 0;
  return {
    async consume(): Promise<QuotaVerdict | null> {
      fx.quota += 1;
      n += 1;
      if (mode === "allow") return { allowed: true };
      if (mode === "deny") return { allowed: false, retryAfterSeconds: 42 };
      if (mode === "unavailable") return null;
      if (mode === "throw") throw new Error(LEAK);
      return n <= mode.allowFirst ? { allowed: true } : { allowed: false, retryAfterSeconds: 60 };
    },
  };
}

function fakeAi(fx: Effects, opts: { content?: unknown; fail?: boolean; hasKey?: boolean; quota?: QuotaMode } = {}): AiRouteDeps {
  return {
    auth: fakeAuth(fx),
    quota: fakeQuota(fx, opts.quota ?? "allow"),
    hasOpenAiKey: () => opts.hasKey ?? true,
    async createChatCompletion() {
      fx.ai += 1;
      if (opts.fail) throw new Error(LEAK);
      return { choices: [{ message: { content: opts.content ?? "Titre de test" } }] };
    },
  };
}

function fakeFetch(fx: Effects, route: (url: string) => { status?: number; json: unknown }): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    fx.fetch.push(url);
    const r = route(url);
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

function post(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const BEARER = (t: string) => ({ Authorization: `Bearer ${t}` });

function assertNoEffects(fx: Effects, label: string) {
  assert.equal(fx.queries.length, 0, `${label} : aucune requête base`);
  assert.equal(fx.storage.length, 0, `${label} : aucun accès stockage`);
  assert.equal(fx.rpc.length, 0, `${label} : aucun appel RPC`);
  assert.equal(fx.fetch.length, 0, `${label} : aucun appel externe`);
  assert.equal(fx.ai, 0, `${label} : aucun appel IA`);
  assert.equal(fx.classify, 0, `${label} : aucun classement`);
  assert.equal(fx.quota, 0, `${label} : aucun quota consommé`);
  assert.equal(fx.googleToken, 0, `${label} : aucune lecture de session Google`);
  assert.equal(fx.extract, 0, `${label} : aucune extraction`);
}

async function bodyOf(res: Response): Promise<string> {
  return res.clone().text();
}
async function assertNoLeak(res: Response, label: string) {
  const t = await bodyOf(res);
  for (const s of [LEAK, VALID_JWT, WEBHOOK_SECRET, "refresh-token-u1", "access-token-u1", "Error:", "stack"]) {
    assert.ok(!t.includes(s), `${label} : la réponse ne doit pas contenir « ${s} » (reçu : ${t})`);
  }
}

// ---------------------------------------------------------------------------
// Fabriques de dépendances par route
// ---------------------------------------------------------------------------
const GOOGLE_CREDS = () => ({ clientId: "test-client", clientSecret: "test-client-secret" });

function googleRoutes(url: string): { status?: number; json: unknown } {
  if (url.startsWith("https://oauth2.googleapis.com/token")) return { json: { access_token: "access-token-u1" } };
  if (url.endsWith("/users/me/profile")) return { json: { historyId: "777" } };
  if (url.includes("/messages?")) return { json: { messages: [{ id: "msg1" }] } };
  if (url.includes("/messages/msg1?format=full")) {
    return {
      json: {
        payload: {
          headers: [{ name: "Subject", value: "Facture test" }],
          parts: [{ filename: "facture.pdf", mimeType: "application/pdf", body: { attachmentId: "att1" } }],
        },
      },
    };
  }
  if (url.includes("/attachments/")) return { json: { data: "JVBERi0xLjQK" } };
  return { status: 404, json: {} };
}

/** Base simulée : le document DOC_U1 appartient à U1, DOC_U2 à U2 ; les filtres user_id sont respectés. */
function docsDb(extra?: (q: Query) => { data?: unknown; error?: unknown } | undefined): DbScript {
  const docs: Record<string, Record<string, unknown>> = {
    [DOC_U1]: { id: DOC_U1, user_id: U1.userId, gmail_email: "u1@qa-a.invalid", gmail_message_id: "msg1", gmail_attachment_id: "att1", title: "doc", file_path: `${U1.userId}/a.pdf`, mime_type: "application/pdf", original_filename: "a.pdf", is_ready: true },
    [DOC_U2]: { id: DOC_U2, user_id: U2_ID, gmail_email: "u2@qa-a.invalid", gmail_message_id: "msg2", gmail_attachment_id: "att2", title: "doc2", file_path: `${U2_ID}/b.pdf`, mime_type: "application/pdf", original_filename: "b.pdf", is_ready: true },
  };
  return (q) => {
    const custom = extra?.(q);
    if (custom) return custom;
    if (q.table === "documents" && q.op === "select") {
      const id = q.filters.find(([k]) => k === "id")?.[1] as string | undefined;
      const uid = q.filters.find(([k]) => k === "user_id")?.[1];
      const d = id ? docs[id] : undefined;
      if (!d || (uid !== undefined && d.user_id !== uid)) return { data: null };
      return { data: d };
    }
    return { data: null };
  };
}

function downloadDeps(fx: Effects, db: DbScript = docsDb(), storage?: StorageScript) {
  return {
    auth: fakeAuth(fx),
    getService: () => fakeSupabase(fx, db, storage),
    resolveRefreshToken: async () => "refresh-token-u1",
    googleCredentials: GOOGLE_CREDS,
    fetch: fakeFetch(fx, googleRoutes),
  };
}

function saveDeps(fx: Effects, db: DbScript = () => ({ data: null }), google: unknown = { googleEmail: "u1@qa-a.invalid", accessToken: "access-token-u1", refreshToken: "refresh-token-u1" }) {
  return {
    auth: fakeAuth(fx),
    getGoogleToken: async () => { fx.googleToken += 1; return google as never; },
    getService: () => fakeSupabase(fx, db),
  };
}

function scanDeps(fx: Effects, conn: unknown = { user_id: U1.userId, email: "u1@qa-a.invalid", refresh_token: "refresh-token-u1", last_history_id: "700" }) {
  return {
    auth: fakeAuth(fx),
    getService: () => fakeSupabase(fx, (q) => {
      if (q.table === "gmail_connections" && q.op === "select") return { data: conn };
      if (q.table === "documents" && q.op === "select") return { data: [] };
      return { data: null };
    }),
    googleCredentials: GOOGLE_CREDS,
    fetch: fakeFetch(fx, googleRoutes),
    now: () => new Date("2026-11-20T12:00:00Z"),
  };
}

function webhookDeps(fx: Effects, opts: { secret?: string; db?: DbScript; quota?: QuotaMode; classifyFail?: boolean } = {}) {
  return {
    webhookSecret: () => opts.secret,
    getService: () => fakeSupabase(fx, opts.db ?? docsDb(), (op) => op === "download" ? { data: new Blob(["texte"]) } : { data: null }),
    quota: fakeQuota(fx, opts.quota ?? "allow"),
    extractText: async () => { fx.extract += 1; return "texte extrait"; },
    classify: async () => { fx.classify += 1; if (opts.classifyFail) throw new Error(LEAK); return { category: "factures" as const, title: "Facture – test" }; },
  };
}
const webhookBody = (id = DOC_U1, extra: Record<string, unknown> = {}) => ({ type: "INSERT", table: "documents", schema: "public", record: { id }, ...extra });

// ---------------------------------------------------------------------------
// Les 7 routes à session : cas communs
// ---------------------------------------------------------------------------
type SessionRoute = { name: string; call: (fx: Effects, req: Request) => Promise<Response>; body: unknown };
const SESSION_ROUTES: SessionRoute[] = [
  { name: "classify-document", body: { fileName: "a.pdf", extractedText: "x" },
    call: (fx, req) => handleClassifyDocument(req, { auth: fakeAuth(fx), quota: fakeQuota(fx), classify: async () => { fx.classify += 1; return { category: "autres", title: "t" }; } }) },
  { name: "rename", body: { fileName: "a.pdf" }, call: (fx, req) => handleRename(req, fakeAi(fx)) },
  { name: "read-pdf", body: { fileUrl: "https://example.invalid/a.pdf" }, call: (fx, req) => handleReadPdf(req, fakeAi(fx)) },
  { name: "generate-document", body: { type: "courrier", details: "d" }, call: (fx, req) => handleGenerateDocument(req, fakeAi(fx)) },
  { name: "gmail/download-attachment", body: { documentId: DOC_U1 }, call: (fx, req) => handleGmailDownloadAttachment(req, downloadDeps(fx)) },
  { name: "google/save-connection", body: {}, call: (fx, req) => handleGoogleSaveConnection(req, saveDeps(fx)) },
  { name: "gmail/scan", body: {}, call: (fx, req) => handleGmailScan(req, scanDeps(fx)) },
];

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------
type T = { name: string; fn: () => Promise<void> };
const tests: T[] = [];
const test = (name: string, fn: () => Promise<void>) => tests.push({ name, fn });

for (const r of SESSION_ROUTES) {
  test(`${r.name} — T1 sans session → 401, aucun effet`, async () => {
    const fx = newEffects();
    const res = await r.call(fx, post(`/api/${r.name}`, r.body));
    assert.equal(res.status, 401);
    assert.equal(fx.verifyCookie, 1, "la session par cookies est vérifiée");
    assertNoEffects(fx, r.name);
    await assertNoLeak(res, r.name);
  });
  test(`${r.name} — T2 en-tête Authorization mal formé → 401 sans vérification ni repli cookies`, async () => {
    for (const h of ["Basic abc", "Bearer", "Bearer abc", "bearer valid jwt"]) {
      const fx = newEffects();
      const res = await r.call(fx, post(`/api/${r.name}`, r.body, { Authorization: h }));
      assert.equal(res.status, 401, h);
      assert.equal(fx.verifyCookie, 0, `${h} : pas de repli sur les cookies`);
      assertNoEffects(fx, `${r.name} (${h})`);
    }
  });
  test(`${r.name} — T2 jeton refusé par le serveur d'authentification → 401, aucun effet`, async () => {
    const fx = newEffects();
    const res = await r.call(fx, post(`/api/${r.name}`, r.body, BEARER("forged.jwt.value")));
    assert.equal(res.status, 401);
    assert.equal(fx.verifyToken, 1, "le jeton est vérifié côté serveur");
    assertNoEffects(fx, r.name);
  });
  test(`${r.name} — T3 jeton expiré → 401, aucun effet, pas de fuite`, async () => {
    const fx = newEffects();
    const res = await r.call(fx, post(`/api/${r.name}`, r.body, BEARER(EXPIRED_JWT)));
    assert.equal(res.status, 401);
    assertNoEffects(fx, r.name);
    const t = await bodyOf(res);
    assert.ok(!t.includes("JWT expired"), "le message interne n'est pas renvoyé");
  });
  test(`${r.name} — T3b cookies avec en-tête valide présent : seul l'en-tête compte`, async () => {
    const fx = newEffects();
    const res = await r.call(fx, post(`/api/${r.name}`, r.body, BEARER("forged.jwt.value")));
    assert.equal(res.status, 401);
    assert.equal(fx.verifyCookie, 0);
  });
}

// --- classify-document ---
test("classify-document — T5 accès légitime → 200 catégorie et titre", async () => {
  const fx = newEffects();
  const res = await handleClassifyDocument(post("/api/classify-document", { fileName: "a.pdf", extractedText: "x" }, BEARER(VALID_JWT)), {
    auth: fakeAuth(fx), quota: fakeQuota(fx), classify: async (p) => { fx.classify += 1; assert.equal(p.fileName, "a.pdf"); return { category: "factures", title: "Facture" }; },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { category: "factures", title: "Facture" });
  assert.equal(fx.quota, 1);
  assert.equal(fx.classify, 1);
});
test("classify-document — T7 quota dépassé → 429 + Retry-After, pas d'IA", async () => {
  const fx = newEffects();
  const res = await handleClassifyDocument(post("/api/classify-document", { fileName: "a" }, BEARER(VALID_JWT)), {
    auth: fakeAuth(fx), quota: fakeQuota(fx, "deny"), classify: async () => { fx.classify += 1; return { category: "autres", title: "t" }; },
  });
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Retry-After"), "42");
  assert.equal(fx.classify, 0);
});
test("classify-document — T7b appels répétés : arrêt au-delà de la limite", async () => {
  const fx = newEffects();
  const deps = { auth: fakeAuth(fx), quota: fakeQuota(fx, { allowFirst: 2 }), classify: async () => { fx.classify += 1; return { category: "autres" as const, title: "t" }; } };
  const statuses: number[] = [];
  for (let i = 0; i < 4; i++) statuses.push((await handleClassifyDocument(post("/api/classify-document", { fileName: "a" }, BEARER(VALID_JWT)), deps)).status);
  assert.deepEqual(statuses, [200, 200, 429, 429]);
  assert.equal(fx.classify, 2, "l'IA n'est appelée que dans la limite");
});
test("classify-document — T8 compteur indisponible ou en erreur → 503, pas d'IA, pas de fuite", async () => {
  for (const mode of ["unavailable", "throw"] as const) {
    const fx = newEffects();
    const res = await handleClassifyDocument(post("/api/classify-document", { fileName: "a" }, BEARER(VALID_JWT)), {
      auth: fakeAuth(fx), quota: fakeQuota(fx, mode), classify: async () => { fx.classify += 1; return { category: "autres", title: "t" }; },
    });
    assert.equal(res.status, 503, mode);
    assert.equal(fx.classify, 0);
    await assertNoLeak(res, mode);
  }
});
test("classify-document — T12 texte trop long → 413, aucun quota consommé", async () => {
  const fx = newEffects();
  const res = await handleClassifyDocument(post("/api/classify-document", { fileName: "a", extractedText: "x".repeat(12001) }, BEARER(VALID_JWT)), {
    auth: fakeAuth(fx), quota: fakeQuota(fx), classify: async () => { fx.classify += 1; return { category: "autres", title: "t" }; },
  });
  assert.equal(res.status, 413);
  assert.equal(fx.quota, 0);
  assert.equal(fx.classify, 0);
});
test("classify-document — T11 erreur interne → 500 générique sans fuite", async () => {
  const fx = newEffects();
  const res = await handleClassifyDocument(post("/api/classify-document", { fileName: "a" }, BEARER(VALID_JWT)), {
    auth: fakeAuth(fx), quota: fakeQuota(fx), classify: async () => { throw new Error(LEAK); },
  });
  assert.equal(res.status, 500);
  await assertNoLeak(res, "classify 500");
});

// --- rename / read-pdf / generate-document ---
test("rename — T5 accès légitime → titre", async () => {
  const fx = newEffects();
  const res = await handleRename(post("/api/rename", { fileName: "a.pdf", extractedText: "x" }, BEARER(VALID_JWT)), fakeAi(fx, { content: " Mon titre " }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { title: "Mon titre" });
  assert.equal(fx.ai, 1);
});
test("rename — T7 quota dépassé → 429 sans IA ; T11 erreur IA → 500 sans fuite", async () => {
  let fx = newEffects();
  let res = await handleRename(post("/api/rename", { fileName: "a" }, BEARER(VALID_JWT)), fakeAi(fx, { quota: "deny" }));
  assert.equal(res.status, 429);
  assert.equal(fx.ai, 0);
  fx = newEffects();
  res = await handleRename(post("/api/rename", { fileName: "a" }, BEARER(VALID_JWT)), fakeAi(fx, { fail: true }));
  assert.equal(res.status, 500);
  await assertNoLeak(res, "rename 500");
});
test("rename — clé OpenAI absente → 503 avant tout quota", async () => {
  const fx = newEffects();
  const res = await handleRename(post("/api/rename", { fileName: "a" }, BEARER(VALID_JWT)), fakeAi(fx, { hasKey: false }));
  assert.equal(res.status, 503);
  assert.equal(fx.quota, 0);
  assert.equal(fx.ai, 0);
});
test("read-pdf — URL non https ou absente → 400 sans quota ni IA", async () => {
  for (const fileUrl of ["http://example.invalid/a.pdf", "file:///etc/passwd", "javascript:alert(1)", undefined, 42]) {
    const fx = newEffects();
    const res = await handleReadPdf(post("/api/read-pdf", { fileUrl }, BEARER(VALID_JWT)), fakeAi(fx));
    assert.equal(res.status, 400, String(fileUrl));
    assert.equal(fx.quota, 0);
    assert.equal(fx.ai, 0);
  }
});
test("read-pdf — T5 accès légitime → texte extrait ; T7 quota → 429", async () => {
  let fx = newEffects();
  let res = await handleReadPdf(post("/api/read-pdf", { fileUrl: "https://example.invalid/a.pdf" }, BEARER(VALID_JWT)), fakeAi(fx, { content: [{ text: "contenu" }] }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { extractedText: "contenu" });
  fx = newEffects();
  res = await handleReadPdf(post("/api/read-pdf", { fileUrl: "https://example.invalid/a.pdf" }, BEARER(VALID_JWT)), fakeAi(fx, { quota: "deny" }));
  assert.equal(res.status, 429);
  assert.equal(fx.ai, 0);
});
test("generate-document — T5 accès légitime par cookies (appel du site) → 200 texte", async () => {
  const fx = newEffects();
  const deps = { ...fakeAi(fx, { content: "Madame, Monsieur…" }), auth: fakeAuth(fx, { cookieUser: U1 }) };
  const res = await handleGenerateDocument(post("/api/generate-document", { type: "courrier", details: "résiliation" }), deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { text: "Madame, Monsieur…" });
  assert.equal(fx.verifyCookie, 1);
  assert.equal(fx.ai, 1);
});
test("generate-document — paramètres manquants → 400 ; clé absente → 503 ; quota → 429 ; erreur IA → 500 sans fuite", async () => {
  let fx = newEffects();
  let res = await handleGenerateDocument(post("/api/generate-document", { type: "courrier" }, BEARER(VALID_JWT)), fakeAi(fx));
  assert.equal(res.status, 400);
  assert.equal(fx.quota, 0);
  fx = newEffects();
  res = await handleGenerateDocument(post("/api/generate-document", { type: "c", details: "d" }, BEARER(VALID_JWT)), fakeAi(fx, { hasKey: false }));
  assert.equal(res.status, 503);
  fx = newEffects();
  res = await handleGenerateDocument(post("/api/generate-document", { type: "c", details: "d" }, BEARER(VALID_JWT)), fakeAi(fx, { quota: "deny" }));
  assert.equal(res.status, 429);
  assert.equal(fx.ai, 0);
  fx = newEffects();
  res = await handleGenerateDocument(post("/api/generate-document", { type: "c", details: "d" }, BEARER(VALID_JWT)), fakeAi(fx, { fail: true }));
  assert.equal(res.status, 500);
  await assertNoLeak(res, "generate 500");
  fx = newEffects();
  res = await handleGenerateDocument(post("/api/generate-document", { type: "c", details: "x".repeat(8001) }, BEARER(VALID_JWT)), fakeAi(fx));
  assert.equal(res.status, 413);
  assert.equal(fx.quota, 0);
});

// --- gmail/download-attachment ---
test("download-attachment — T4 document d'un autre compte → 404 identique à « introuvable », aucun effet externe", async () => {
  const fxOther = newEffects();
  const other = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", { documentId: DOC_U2 }, BEARER(VALID_JWT)), downloadDeps(fxOther));
  const fxNone = newEffects();
  const none = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", { documentId: "00000000-0000-4000-8000-0000000000ff" }, BEARER(VALID_JWT)), downloadDeps(fxNone));
  assert.equal(other.status, 404);
  assert.equal(none.status, 404);
  assert.equal(await other.text(), await none.text(), "aucune différence révélant l'existence du document");
  assert.deepEqual(fxOther.queries[0].filters, [["id", DOC_U2], ["user_id", U1.userId]], "propriété vérifiée dans la requête");
  assert.equal(fxOther.fetch.length, 0, "aucun appel Gmail");
  assert.equal(fxOther.storage.length, 0, "aucune écriture stockage");
  assert.equal(fxOther.queries.filter((q) => q.op !== "select").length, 0, "aucune écriture base");
});
test("download-attachment — défense en profondeur : ligne d'un autre compte renvoyée malgré le filtre → 404", async () => {
  const fx = newEffects();
  const db: DbScript = (q) => (q.table === "documents" && q.op === "select" ? { data: { id: DOC_U2, user_id: U2_ID, gmail_message_id: "m", gmail_attachment_id: "a" } } : { data: null });
  const res = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", { documentId: DOC_U2 }, BEARER(VALID_JWT)), downloadDeps(fx, db));
  assert.equal(res.status, 404);
  assert.equal(fx.fetch.length, 0);
  assert.equal(fx.storage.length, 0);
});
test("download-attachment — identifiant absent → 400 ; non uuid → 404 ; aucun effet", async () => {
  let fx = newEffects();
  let res = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", {}, BEARER(VALID_JWT)), downloadDeps(fx));
  assert.equal(res.status, 400);
  assert.equal(fx.queries.length, 0);
  fx = newEffects();
  res = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", { documentId: "../../etc" }, BEARER(VALID_JWT)), downloadDeps(fx));
  assert.equal(res.status, 404);
  assert.equal(fx.queries.length, 0);
});
test("download-attachment — T5 accès légitime → 200, chemin et mise à jour limités au propriétaire", async () => {
  const fx = newEffects();
  const res = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", { documentId: DOC_U1 }, BEARER(VALID_JWT)), downloadDeps(fx));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  assert.deepEqual(fx.storage, [{ bucket: "documents", op: "upload", path: `${U1.userId}/${DOC_U1}.pdf` }]);
  const upd = fx.queries.find((q) => q.op === "update");
  assert.ok(upd, "mise à jour effectuée");
  assert.deepEqual(upd!.filters, [["id", DOC_U1], ["user_id", U1.userId]]);
  assert.ok(fx.fetch.every((u) => u.startsWith("https://oauth2.googleapis.com/") || u.startsWith("https://gmail.googleapis.com/")));
});
test("download-attachment — T11 erreur de stockage → 500 sans fuite", async () => {
  const fx = newEffects();
  const res = await handleGmailDownloadAttachment(post("/api/gmail/download-attachment", { documentId: DOC_U1 }, BEARER(VALID_JWT)), downloadDeps(fx, docsDb(), (op) => op === "upload" ? { error: { message: LEAK } } : { data: null }));
  assert.equal(res.status, 500);
  await assertNoLeak(res, "download 500");
  assert.equal(fx.queries.filter((q) => q.op === "update").length, 0, "pas de mise à jour après l'échec");
});

// --- google/save-connection ---
test("save-connection — T6 user_id falsifié → 403, aucune lecture Google ni écriture", async () => {
  const fx = newEffects();
  const res = await handleGoogleSaveConnection(post("/api/google/save-connection", { user_id: U2_ID }, BEARER(VALID_JWT)), saveDeps(fx));
  assert.equal(res.status, 403);
  assert.equal(fx.googleToken, 0);
  assert.equal(fx.queries.length, 0);
});
test("save-connection — T5 accès légitime → écriture pour l'utilisateur de la session uniquement", async () => {
  for (const body of [{}, { user_id: U1.userId }]) {
    const fx = newEffects();
    const res = await handleGoogleSaveConnection(post("/api/google/save-connection", body, BEARER(VALID_JWT)), saveDeps(fx));
    assert.equal(res.status, 200);
    await assertNoLeak(res, "save 200");
    assert.deepEqual(await res.json(), { success: true, mode: "inserted" });
    const ins = fx.queries.find((q) => q.op === "insert");
    assert.equal((ins!.payload as { user_id: string }).user_id, U1.userId);
  }
});
test("save-connection — connexion existante → mise à jour avec l'utilisateur de la session", async () => {
  const fx = newEffects();
  const res = await handleGoogleSaveConnection(post("/api/google/save-connection", {}, BEARER(VALID_JWT)), saveDeps(fx, (q) => (q.op === "select" ? { data: { id: "conn1" } } : { data: null })));
  assert.equal(res.status, 200);
  const upd = fx.queries.find((q) => q.op === "update");
  assert.equal((upd!.payload as { user_id: string }).user_id, U1.userId);
  assert.deepEqual(upd!.filters, [["id", "conn1"]]);
});
test("save-connection — session Google absente → 401 sans écriture ; erreur base → 500 sans fuite", async () => {
  let fx = newEffects();
  let res = await handleGoogleSaveConnection(post("/api/google/save-connection", {}, BEARER(VALID_JWT)), saveDeps(fx, undefined, null));
  assert.equal(res.status, 401);
  assert.equal(fx.queries.length, 0);
  fx = newEffects();
  res = await handleGoogleSaveConnection(post("/api/google/save-connection", {}, BEARER(VALID_JWT)), saveDeps(fx, () => ({ error: { message: LEAK } })));
  assert.equal(res.status, 500);
  await assertNoLeak(res, "save 500");
});

// --- gmail/scan ---
test("gmail/scan — T6 userId falsifié → 403, aucun effet", async () => {
  const fx = newEffects();
  const res = await handleGmailScan(post("/api/gmail/scan", { userId: U2_ID }, BEARER(VALID_JWT)), scanDeps(fx));
  assert.equal(res.status, 403);
  assert.equal(fx.queries.length, 0);
  assert.equal(fx.fetch.length, 0);
});
test("gmail/scan — T5 premier passage → curseur enregistré pour l'utilisateur de la session", async () => {
  const fx = newEffects();
  const res = await handleGmailScan(post("/api/gmail/scan", {}, BEARER(VALID_JWT)), scanDeps(fx, { user_id: U1.userId, email: "u1@qa-a.invalid", refresh_token: "refresh-token-u1", last_history_id: null }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { created: 0, firstTime: true });
  assert.ok(fx.queries.every((q) => q.filters.some(([k, v]) => k === "user_id" && v === U1.userId)), "toutes les requêtes ciblent l'utilisateur de la session");
});
test("gmail/scan — T5 nouveaux messages → document créé pour l'utilisateur de la session uniquement", async () => {
  const fx = newEffects();
  const res = await handleGmailScan(post("/api/gmail/scan", { userId: U1.userId }, BEARER(VALID_JWT)), scanDeps(fx));
  assert.equal(res.status, 200);
  await assertNoLeak(res, "scan 200");
  assert.deepEqual(await res.json(), { created: 1 });
  const ins = fx.queries.filter((q) => q.op === "insert");
  assert.equal(ins.length, 1);
  assert.equal((ins[0].payload as { user_id: string }).user_id, U1.userId);
});
test("gmail/scan — aucune connexion → 400 sans appel Google", async () => {
  const fx = newEffects();
  const res = await handleGmailScan(post("/api/gmail/scan", {}, BEARER(VALID_JWT)), scanDeps(fx, null));
  assert.equal(res.status, 400);
  assert.equal(fx.fetch.length, 0);
});

// --- process-new-document (webhook) ---
test("webhook — T9 secret non configuré → 503, aucun effet (refus par défaut)", async () => {
  for (const secret of [undefined, "", "   "]) {
    const fx = newEffects();
    const res = await handleProcessNewDocument(post("/api/process-new-document", webhookBody(), { [WEBHOOK_SECRET_HEADER]: "anything" }), webhookDeps(fx, { secret }));
    assert.equal(res.status, 503);
    assertNoEffects(fx, "webhook non configuré");
  }
});
test("webhook — T9 sans en-tête ou mauvais secret → 401, aucun effet", async () => {
  const headerCases: Array<Record<string, string>> = [{}, { [WEBHOOK_SECRET_HEADER]: "wrong" }, { [WEBHOOK_SECRET_HEADER]: WEBHOOK_SECRET + "x" }, BEARER(VALID_JWT)];
  for (const headers of headerCases) {
    const fx = newEffects();
    const res = await handleProcessNewDocument(post("/api/process-new-document", webhookBody(), headers), webhookDeps(fx, { secret: WEBHOOK_SECRET }));
    assert.equal(res.status, 401, JSON.stringify(headers));
    assertNoEffects(fx, "webhook mauvais secret");
    await assertNoLeak(res, "webhook 401");
  }
});
test("webhook — T10 secret de test : charge invalide → 400 ; DELETE → ok sans effet", async () => {
  const H = { [WEBHOOK_SECRET_HEADER]: WEBHOOK_SECRET };
  for (const body of [webhookBody(DOC_U1, { table: "profiles" }), webhookBody(DOC_U1, { schema: "auth" }), webhookBody("not-a-uuid"), { type: "TRUNCATE" }, "not json"]) {
    const fx = newEffects();
    const res = await handleProcessNewDocument(post("/api/process-new-document", body, H), webhookDeps(fx, { secret: WEBHOOK_SECRET }));
    assert.equal(res.status, 400, JSON.stringify(body));
    assertNoEffects(fx, "webhook charge invalide");
  }
  const fx = newEffects();
  const res = await handleProcessNewDocument(post("/api/process-new-document", { type: "DELETE", table: "documents", schema: "public", old_record: { id: DOC_U1 } }, H), webhookDeps(fx, { secret: WEBHOOK_SECRET }));
  assert.equal(res.status, 200);
  assertNoEffects(fx, "webhook DELETE");
});
test("webhook — T10 secret de test, document prêt → classé et mis à jour ; réponse réduite à { ok: true }", async () => {
  const fx = newEffects();
  const res = await handleProcessNewDocument(post("/api/process-new-document", webhookBody(), { [WEBHOOK_SECRET_HEADER]: WEBHOOK_SECRET }), webhookDeps(fx, { secret: WEBHOOK_SECRET }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true }, "ni titre ni catégorie dans la réponse");
  const upd = fx.queries.find((q) => q.op === "update");
  assert.deepEqual(upd!.payload, { title: "Facture – test", category: "factures" });
  assert.deepEqual(upd!.filters, [["id", DOC_U1]]);
  assert.equal(fx.quota, 1);
  assert.equal(fx.fetch.length, 0, "plus d'appel HTTP vers /api/classify-document");
});
test("webhook — quota du propriétaire dépassé → 429, pas de téléchargement ni d'IA", async () => {
  const fx = newEffects();
  const res = await handleProcessNewDocument(post("/api/process-new-document", webhookBody(), { [WEBHOOK_SECRET_HEADER]: WEBHOOK_SECRET }), webhookDeps(fx, { secret: WEBHOOK_SECRET, quota: "deny" }));
  assert.equal(res.status, 429);
  assert.equal(fx.storage.length, 0);
  assert.equal(fx.classify, 0);
});
test("webhook — erreur interne → 500 générique sans fuite, aucune mise à jour", async () => {
  const fx = newEffects();
  const res = await handleProcessNewDocument(post("/api/process-new-document", webhookBody(), { [WEBHOOK_SECRET_HEADER]: WEBHOOK_SECRET }), webhookDeps(fx, { secret: WEBHOOK_SECRET, classifyFail: true }));
  assert.equal(res.status, 500);
  await assertNoLeak(res, "webhook 500");
  assert.equal(fx.queries.filter((q) => q.op === "update").length, 0);
});

// --- apiAuth ---
test("apiAuth — comparaison de secret, utilisateur invalide, lecture stricte du quota", async () => {
  assert.equal(safeEqualSecret("abc", "abc"), true);
  assert.equal(safeEqualSecret("abd", "abc"), false);
  assert.equal(safeEqualSecret("", "abc"), false);
  assert.equal(safeEqualSecret(null, "abc"), false);
  const fx = newEffects();
  const badUser = await authenticateRequest(post("/x", {}, BEARER(VALID_JWT)), {
    verifyAccessToken: async () => ({ userId: "not-a-uuid", email: null }),
    verifyCookieSession: async () => null,
  });
  assert.equal(badUser, null, "un identifiant non uuid n'est pas une identité");
  void fx;
  assert.deepEqual(parseQuotaRows([{ allowed: true }]), { allowed: true });
  assert.deepEqual(parseQuotaRows([{ allowed: false, retry_after_seconds: 60 }]), { allowed: false, retryAfterSeconds: 60 });
  assert.equal(parseQuotaRows([]), null);
  assert.equal(parseQuotaRows({ allowed: true }), null);
  assert.equal(parseQuotaRows([{ allowed: "yes" }]), null);
});

// --- T13 garde-fou statique sur les 8 fichiers route.ts ---
test("T13 — les 8 routes déléguent à un gestionnaire sécurisé et n'appellent plus directement Supabase ni OpenAI", async () => {
  const root = join(__dirname, "../../../app/api");
  const expected: Record<string, string> = {
    "process-new-document": "handleProcessNewDocument",
    "classify-document": "handleClassifyDocument",
    "read-pdf": "handleReadPdf",
    rename: "handleRename",
    "generate-document": "handleGenerateDocument",
    "gmail/download-attachment": "handleGmailDownloadAttachment",
    "google/save-connection": "handleGoogleSaveConnection",
    "gmail/scan": "handleGmailScan",
  };
  for (const [route, handler] of Object.entries(expected)) {
    const src = readFileSync(join(root, route, "route.ts"), "utf8");
    assert.ok(src.includes(`return ${handler}(req,`), `${route} : délègue à ${handler}`);
    assert.ok(!/from\s+["']openai["']/.test(src), `${route} : pas d'import OpenAI direct`);
    assert.ok(!/createClient\s*\(/.test(src), `${route} : pas de client Supabase créé directement`);
    assert.ok(!/req\.json\(\)/.test(src), `${route} : pas de lecture du corps hors gestionnaire`);
  }
});

// --- Inventaire informatif (non bloquant) : autres routes hors périmètre SEC-1 ---
function listRoutes(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listRoutes(p));
    else if (name === "route.ts") out.push(p);
  }
  return out;
}

void (async () => {
  let passed = 0;
  const failures: string[] = [];
  for (const t of tests) {
    try {
      await t.fn();
      passed += 1;
      console.log(`  OK   ${t.name}`);
    } catch (e: unknown) {
      failures.push(t.name);
      console.log(`  ÉCHEC ${t.name}\n       ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const root = join(__dirname, "../../../app/api");
  const others = listRoutes(root)
    .filter((p) => !/(process-new-document|classify-document|read-pdf|rename|generate-document|download-attachment|save-connection|gmail\/scan)\/route\.ts$/.test(p))
    .filter((p) => /SERVICE_ROLE|getServiceSupabase|from\s+["']openai["']|classifyDocumentWithOpenAI/.test(readFileSync(p, "utf8")))
    .map((p) => p.slice(root.length + 1));
  console.log(`\n  Info (hors périmètre SEC-1, non testé ici) : autres routes utilisant la clé serveur ou l'IA : ${others.join(", ")}`);
  console.log(`\n[verify-api-routes-auth] ${passed}/${tests.length} tests réussis`);
  if (failures.length) {
    console.log(`[verify-api-routes-auth] ÉCHECS : ${failures.length}`);
    process.exit(1);
  }
})();
