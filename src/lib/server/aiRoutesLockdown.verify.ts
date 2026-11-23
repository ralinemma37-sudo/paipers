/**
 * SEC-A1/A2 (E13, 23/11/2026) — verrou des anciennes routes d'IA et protection de /api/generate-document.
 * Données fictives uniquement, aucun réseau : fetch est remplacé par un faux serveur (authentification Supabase
 * et OpenAI simulés) qui refuse toute autre adresse.
 * Lancer : npx tsx src/lib/server/aiRoutesLockdown.verify.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// --- Faux réseau : seuls deux points d'accès fictifs existent, tout le reste est refusé et compté ---
const FAKE_SUPABASE = "https://fake-project.invalid";
const VALID_TOKEN = "fake-access-token-VALIDE";
const USER_A = "00000000-0000-4000-8000-0000000000a1";
const USER_B = "00000000-0000-4000-8000-0000000000b2";
const SECRET_MARK = "secret-interne-xyz";

type OpenAIMode = "ok" | "error";
let openaiMode: OpenAIMode = "ok";
const calls = { auth: 0, openai: 0, other: [] as string[] };
let lastOpenAIBody = "";
let lastOpenAIAuth = "";

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  if (url.startsWith(`${FAKE_SUPABASE}/auth/v1/user`)) {
    calls.auth += 1;
    if (headers.get("authorization") === `Bearer ${VALID_TOKEN}`) {
      return new Response(
        JSON.stringify({ id: USER_A, aud: "authenticated", role: "authenticated", email: "a@exemple.invalid" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ code: 401, msg: "invalid JWT" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (url.startsWith("https://api.openai.com/v1/chat/completions")) {
    calls.openai += 1;
    lastOpenAIAuth = headers.get("authorization") ?? "";
    lastOpenAIBody = typeof init?.body === "string" ? init.body : "";
    if (openaiMode === "error") {
      // 400 : pas de nouvelle tentative du SDK. Le message ne doit jamais ressortir.
      return new Response(JSON.stringify({ error: { message: SECRET_MARK, type: "invalid_request_error" } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        id: "chatcmpl-fictif",
        object: "chat.completion",
        created: 0,
        model: "gpt-4o-mini",
        choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "Lettre fictive" } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
  calls.other.push(url);
  throw new Error("RÉSEAU INTERDIT PENDANT LES TESTS");
}) as typeof fetch;

// --- Variables sensibles factices : elles ne doivent jamais apparaître dans une réponse ---
const FAKE_ENV: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: FAKE_SUPABASE,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "fake-anon-key-XYZ",
  SUPABASE_URL: FAKE_SUPABASE,
  SUPABASE_SERVICE_ROLE_KEY: "fake-service-role-key-XYZ",
  OPENAI_API_KEY: "fake-openai-key-XYZ",
  APP_URL: "https://app.exemple.invalid",
  NEXT_PUBLIC_BASE_URL: "https://app.exemple.invalid",
  GOOGLE_CLIENT_ID: "fake-google-client-id-XYZ",
  GOOGLE_CLIENT_SECRET: "fake-google-client-secret-XYZ",
  GOOGLE_REDIRECT_URI: "https://app.exemple.invalid/callback",
};
Object.assign(process.env, FAKE_ENV);

import * as processNewDocument from "@/app/api/process-new-document/route";
import * as analyzeDocument from "@/app/api/ai/analyze-document/route";
import * as readPdf from "@/app/api/read-pdf/route";
import * as rename from "@/app/api/rename/route";
import * as classifyDocument from "@/app/api/classify-document/route";
import * as processEmail from "@/app/api/google/process-email/route";
import * as generateDocument from "@/app/api/generate-document/route";

type Handler = (req: Request) => Promise<Response>;

const DISABLED: { file: string; path: string; mod: Record<string, unknown> }[] = [
  { file: "src/app/api/process-new-document/route.ts", path: "/api/process-new-document", mod: processNewDocument },
  { file: "src/app/api/ai/analyze-document/route.ts", path: "/api/ai/analyze-document", mod: analyzeDocument },
  { file: "src/app/api/read-pdf/route.ts", path: "/api/read-pdf", mod: readPdf },
  { file: "src/app/api/rename/route.ts", path: "/api/rename", mod: rename },
  { file: "src/app/api/classify-document/route.ts", path: "/api/classify-document", mod: classifyDocument },
  { file: "src/app/api/google/process-email/route.ts", path: "/api/google/process-email", mod: processEmail },
];

/** Cookie de session au format @supabase/ssr (sb-<ref>-auth-token = « base64- » + base64url(JSON)). */
function sessionCookie(token: string, userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const session = {
    access_token: token,
    refresh_token: "fake-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    user: { id: userId, aud: "authenticated", role: "authenticated" },
  };
  return `sb-fake-project-auth-token=base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}

function post(path: string, body: unknown, cookie?: string): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers.cookie = cookie;
  return new Request(`https://app.exemple.invalid${path}`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function resetCalls() {
  calls.auth = 0;
  calls.openai = 0;
  calls.other.length = 0;
  openaiMode = "ok";
  lastOpenAIBody = "";
  lastOpenAIAuth = "";
}

function assertNoLeak(text: string) {
  for (const v of Object.values(FAKE_ENV)) {
    if (v.startsWith("http")) continue;
    assert.ok(!text.includes(v), `valeur sensible présente dans la réponse : ${v}`);
  }
  assert.ok(!text.includes(SECRET_MARK), "message interne d'OpenAI présent dans la réponse");
  assert.ok(!/service_role|stack|at .*\.ts:\d+/i.test(text), "détail technique présent dans la réponse");
}

const generate = generateDocument.POST as Handler;
const tests: { name: string; fn: () => Promise<void> | void }[] = [];
const test = (name: string, fn: () => Promise<void> | void) => tests.push({ name, fn });

// T1 — les six routes désactivées : 410 neutre, aucun service appelé, corps non lu.
for (const r of DISABLED) {
  test(`T1 ${r.path} : 410 { error: "gone" }, no-store, aucun appel, corps non lu`, async () => {
    resetCalls();
    assert.deepEqual(Object.keys(r.mod).filter((k) => k !== "default").sort(), ["POST"], "méthodes exportées");
    const req = post(r.path, { filename: "x.pdf", storage_path: `${USER_B}/x.pdf`, email: "b@exemple.invalid" });
    const res = await (r.mod.POST as Handler)(req);
    assert.equal(res.status, 410);
    assert.equal(res.headers.get("cache-control"), "no-store");
    const text = await res.text();
    assert.deepEqual(JSON.parse(text), { error: "gone" });
    assert.equal(req.bodyUsed, false, "le corps de la requête a été lu");
    assert.equal(calls.auth + calls.openai + calls.other.length, 0, "un service a été appelé");
    assertNoLeak(text);
  });
}

// T2 — corps de webhook visant le document d'un autre utilisateur : refusé sans aucune lecture.
test("T2 process-new-document, faux webhook sur le document d'un autre : 410, aucune lecture", async () => {
  resetCalls();
  const req = post("/api/process-new-document", {
    type: "INSERT",
    table: "documents",
    schema: "public",
    record: { id: "00000000-0000-4000-8000-00000000d0c1", user_id: USER_B },
    old_record: null,
  });
  const res = await (processNewDocument.POST as Handler)(req);
  assert.equal(res.status, 410);
  assert.equal(req.bodyUsed, false);
  assert.equal(calls.auth + calls.openai + calls.other.length, 0);
});

// T3 — generate-document anonyme ou avec une fausse preuve : 401, OpenAI jamais appelé.
test("T3a generate-document sans cookie : 401, aucun appel", async () => {
  resetCalls();
  const res = await generate(post("/api/generate-document", { type: "Lettre", details: "Bonjour" }));
  assert.equal(res.status, 401);
  assertNoLeak(await res.text());
  assert.equal(calls.openai, 0);
  assert.equal(calls.auth, 0);
});
test("T3b generate-document avec un identifiant utilisateur dans le corps : 401", async () => {
  resetCalls();
  const res = await generate(
    post("/api/generate-document", { type: "Lettre", details: "Bonjour", user_id: USER_A, userId: USER_A }),
  );
  assert.equal(res.status, 401);
  assert.equal(calls.openai, 0);
});
test("T3c generate-document avec un jeton refusé par le serveur d'authentification : 401", async () => {
  resetCalls();
  const res = await generate(
    post("/api/generate-document", { type: "Lettre", details: "Bonjour" }, sessionCookie("jeton-forge", USER_A)),
  );
  assert.equal(res.status, 401);
  assert.equal(calls.auth, 1, "la session doit être vérifiée par le serveur (getUser)");
  assert.equal(calls.openai, 0);
});
test("T3d generate-document sans configuration Supabase : 401", async () => {
  resetCalls();
  const saved = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    const res = await generate(
      post("/api/generate-document", { type: "Lettre", details: "Bonjour" }, sessionCookie(VALID_TOKEN, USER_A)),
    );
    assert.equal(res.status, 401);
    assert.equal(calls.auth + calls.openai, 0);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = saved;
  }
});

// T4 — parcours légitime de la page Rédiger.
test("T4 generate-document connecté : 200 { text }, un seul appel OpenAI", async () => {
  resetCalls();
  const res = await generate(
    post(
      "/api/generate-document",
      { type: "Lettre de résiliation", details: "Résilier mon abonnement fictif." },
      sessionCookie(VALID_TOKEN, USER_A),
    ),
  );
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { text: "Lettre fictive" });
  assert.equal(calls.auth, 1);
  assert.equal(calls.openai, 1);
  assert.equal(calls.other.length, 0);
  assert.equal(lastOpenAIAuth, `Bearer ${FAKE_ENV.OPENAI_API_KEY}`);
  assert.equal(JSON.parse(lastOpenAIBody).model, "gpt-4o-mini");
  assert.ok(lastOpenAIBody.includes("Lettre de résiliation"));
});

// T5 — entrées trop volumineuses : 413 avant OpenAI.
test("T5a details de 8 001 caractères : 413, OpenAI non appelé", async () => {
  resetCalls();
  const res = await generate(
    post("/api/generate-document", { type: "Lettre", details: "x".repeat(8001) }, sessionCookie(VALID_TOKEN, USER_A)),
  );
  assert.equal(res.status, 413);
  assert.equal(calls.openai, 0);
});
test("T5b type de 201 caractères : 413, OpenAI non appelé", async () => {
  resetCalls();
  const res = await generate(
    post("/api/generate-document", { type: "t".repeat(201), details: "ok" }, sessionCookie(VALID_TOKEN, USER_A)),
  );
  assert.equal(res.status, 413);
  assert.equal(calls.openai, 0);
});
test("T5c limites exactes (200 / 8 000) acceptées", async () => {
  resetCalls();
  const res = await generate(
    post(
      "/api/generate-document",
      { type: "t".repeat(200), details: "d".repeat(8000) },
      sessionCookie(VALID_TOKEN, USER_A),
    ),
  );
  assert.equal(res.status, 200);
  assert.equal(calls.openai, 1);
});
test("T5d corps brut de plus de 20 000 caractères : 413, OpenAI non appelé", async () => {
  resetCalls();
  const res = await generate(
    post(
      "/api/generate-document",
      { type: "Lettre", details: "ok", bourrage: "z".repeat(25000) },
      sessionCookie(VALID_TOKEN, USER_A),
    ),
  );
  assert.equal(res.status, 413);
  assert.equal(calls.openai, 0);
});
test("T5e champs absents ou non textuels : 400, OpenAI non appelé", async () => {
  resetCalls();
  for (const body of [{ type: "Lettre" }, { type: 12, details: "x" }, "pas du json"]) {
    const res = await generate(post("/api/generate-document", body, sessionCookie(VALID_TOKEN, USER_A)));
    assert.equal(res.status, 400);
  }
  assert.equal(calls.openai, 0);
});

// T6 — clé OpenAI absente : 503, rien ne part.
test("T6 clé OpenAI absente : 503, aucune fuite", async () => {
  resetCalls();
  const saved = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const res = await generate(
      post("/api/generate-document", { type: "Lettre", details: "Bonjour" }, sessionCookie(VALID_TOKEN, USER_A)),
    );
    assert.equal(res.status, 503);
    assertNoLeak(await res.text());
    assert.equal(calls.openai, 0);
  } finally {
    process.env.OPENAI_API_KEY = saved;
  }
});

// T7 — erreur OpenAI : 500 générique, le message interne ne ressort pas.
test("T7 erreur OpenAI : 500 « Erreur IA », aucun message interne", async () => {
  resetCalls();
  openaiMode = "error";
  const res = await generate(
    post("/api/generate-document", { type: "Lettre", details: "Bonjour" }, sessionCookie(VALID_TOKEN, USER_A)),
  );
  assert.equal(res.status, 500);
  const text = await res.text();
  assert.deepEqual(JSON.parse(text), { error: "Erreur IA" });
  assertNoLeak(text);
});

// T8 — aucune route de ce lot ne lit un document à partir d'un identifiant fourni.
const read = (f: string) => readFileSync(join(__dirname, "../../..", f), "utf8");
test("T8 routes désactivées : aucune lecture de documents, de stockage ni de clé admin dans le code", () => {
  for (const r of DISABLED) {
    const src = read(r.file);
    for (const forbidden of [
      'from("documents")',
      "storage",
      "SUPABASE_SERVICE_ROLE_KEY",
      "createClient",
      "@/lib/supabase",
      "new OpenAI",
      "req.json",
      "process.env",
      "fetch(",
    ]) {
      assert.ok(!src.includes(forbidden), `${r.file} contient encore « ${forbidden} »`);
    }
    assert.ok(src.includes("legacyApiGoneResponse()"), `${r.file} : réponse 410 absente`);
  }
});

// T9 — code branché : protection avant toute lecture, OAuth toujours verrouillé.
test("T9 generate-document : session vérifiée avant la lecture du corps et avant OpenAI", () => {
  const src = read("src/app/api/generate-document/route.ts");
  const iAuth = src.indexOf("await requireWebUser(req)");
  assert.ok(iAuth > 0, "requireWebUser absent");
  assert.ok(iAuth < src.indexOf("req.text()"), "corps lu avant la vérification de session");
  assert.ok(iAuth < src.indexOf("new OpenAI"), "OpenAI créé avant la vérification de session");
  assert.ok(!/e\.message|error\.message|String\(e\)/.test(src), "message d'erreur interne renvoyé");
  const guard = read("src/lib/server/requireWebUser.ts");
  assert.ok(guard.includes("auth.getUser()"), "la session doit être validée par getUser()");
  assert.ok(!/getSession\(/.test(guard), "getSession() ne prouve pas l'identité côté serveur");
  assert.ok(!/user_id|userId\s*=\s*.*(body|json)/.test(guard.replace(/userId: string|\{ userId \}|data\?\.user\?\.id/g, "")));
});
test("T9 correctifs OAuth existants toujours en place (10 routes)", () => {
  for (const f of [
    "src/app/auth/gmail/route.ts",
    "src/app/auth/gmail/open/route.ts",
    "src/app/auth/gmail/callback/route.ts",
    "src/app/auth/outlook/route.ts",
    "src/app/auth/outlook/open/route.ts",
    "src/app/auth/outlook/callback/route.ts",
    "src/app/api/gmail/auth/route.ts",
    "src/app/api/gmail/callback/route.ts",
    "src/app/api/google/save-connection/route.ts",
    "src/app/api/auth/[...nextauth]/route.ts",
  ]) {
    assert.ok(read(f).includes("legacyOAuthRefusalResponse"), `${f} n'est plus verrouillée`);
  }
});

(async () => {
  let ok = 0;
  for (const t of tests) {
    try {
      await t.fn();
      ok += 1;
      console.log(`  OK   ${t.name}`);
    } catch (e) {
      console.error(`  ÉCHEC ${t.name}\n       ${(e as Error).message}`);
      process.exitCode = 1;
    }
  }
  console.log(
    `\n[verify-ai-routes-lockdown] ${ok}/${tests.length} tests réussis — appels hors faux serveur : ${calls.other.length}`,
  );
  if (ok !== tests.length) process.exit(1);
})();
