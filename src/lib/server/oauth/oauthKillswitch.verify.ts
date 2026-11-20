/**
 * SEC-1C phase 0 — Tests du verrou OAuth Gmail / Outlook.
 * Exécution : tsx src/lib/server/oauth/oauthKillswitch.verify.ts
 *
 * Les VRAIS gestionnaires des 6 routes sont appelés avec de vraies requêtes `Request` (anciens liens avec
 * user_id, state non signés ou falsifiés, codes présents ou absents, erreurs du fournisseur, appels répétés).
 * `fetch` est remplacé par un espion qui enregistre et refuse tout appel : aucun réseau possible.
 * Ces tests prouvent le comportement du code ; ils ne valent pas validation d'un déploiement réel.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// --- Aucun réseau : tout appel à fetch est enregistré puis refusé ---
const fetchCalls: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL) => {
  fetchCalls.push(String(input));
  throw new Error("RÉSEAU INTERDIT PENDANT LES TESTS");
}) as typeof fetch;

// --- Variables sensibles factices : elles ne doivent ni servir ni apparaître ---
const FAKE_ENV: Record<string, string> = {
  GOOGLE_CLIENT_ID: "fake-google-client-id-XYZ",
  GOOGLE_CLIENT_SECRET: "fake-google-client-secret-XYZ",
  GOOGLE_REDIRECT_URI: "https://example.invalid/auth/gmail/callback",
  MICROSOFT_CLIENT_ID: "fake-ms-client-id-XYZ",
  MICROSOFT_CLIENT_SECRET: "fake-ms-client-secret-XYZ",
  MICROSOFT_REDIRECT_URI: "https://example.invalid/auth/outlook/callback",
  NEXT_PUBLIC_SUPABASE_URL: "https://fake-project.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "fake-service-role-key-XYZ",
};
Object.assign(process.env, FAKE_ENV);

import * as gmailEntry from "@/app/auth/gmail/route";
import * as gmailOpen from "@/app/auth/gmail/open/route";
import * as gmailCallback from "@/app/auth/gmail/callback/route";
import * as outlookEntry from "@/app/auth/outlook/route";
import * as outlookOpen from "@/app/auth/outlook/open/route";
import * as outlookCallback from "@/app/auth/outlook/callback/route";
import { legacyOAuthRefusalHtml } from "@/lib/server/oauth/legacyRefusal";

type Handler = (req?: Request) => Promise<Response>;
type RouteCase = { file: string; path: string; provider: "Gmail" | "Outlook"; mod: Record<string, unknown> };

const ROUTES: RouteCase[] = [
  { file: "gmail/route.ts", path: "/auth/gmail", provider: "Gmail", mod: gmailEntry },
  { file: "gmail/open/route.ts", path: "/auth/gmail/open", provider: "Gmail", mod: gmailOpen },
  { file: "gmail/callback/route.ts", path: "/auth/gmail/callback", provider: "Gmail", mod: gmailCallback },
  { file: "outlook/route.ts", path: "/auth/outlook", provider: "Outlook", mod: outlookEntry },
  { file: "outlook/open/route.ts", path: "/auth/outlook/open", provider: "Outlook", mod: outlookOpen },
  { file: "outlook/callback/route.ts", path: "/auth/outlook/callback", provider: "Outlook", mod: outlookCallback },
];

// --- Données synthétiques ---
const VICTIM = "00000000-0000-4000-8000-0000000000a1";
const ATTACKER = "00000000-0000-4000-8000-0000000000b2";
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o), "utf8").toString("base64url");
const OLD_STATE = b64({ user_id: VICTIM, platform: "mobile", account_scope: "personal", t: 1763600000000 });
const FORGED_STATE = b64({ user_id: ATTACKER, platform: "web", account_scope: "professional", t: Date.now() });
const SIGNED_LOOKING_STATE = "v1.kid1.eyJ0ZXN0IjoxfQ.c2lnbmF0dXJlLWZhdXNzZQ";
const CODE = "4/0AQSTgQ-FAKE-AUTH-CODE-1234567890";
const MS_CODE = "M.C105_BAY.2.U.FAKE-MS-CODE-abcdef";

const QUERIES: Array<{ label: string; qs: string; secrets: string[] }> = [
  { label: "sans paramètre", qs: "", secrets: [] },
  { label: "ancien lien avec user_id", qs: `?user_id=${VICTIM}&platform=mobile&account_scope=personal`, secrets: [VICTIM] },
  { label: "user_id d'un tiers + scope pro", qs: `?user_id=${ATTACKER}&platform=web&account_scope=professional`, secrets: [ATTACKER] },
  { label: "code + ancien state non signé", qs: `?code=${encodeURIComponent(CODE)}&state=${OLD_STATE}`, secrets: [CODE, OLD_STATE, VICTIM] },
  { label: "code + state falsifié", qs: `?code=${encodeURIComponent(MS_CODE)}&state=${FORGED_STATE}`, secrets: [MS_CODE, FORGED_STATE, ATTACKER] },
  { label: "code + state d'apparence signée", qs: `?code=${encodeURIComponent(CODE)}&state=${SIGNED_LOOKING_STATE}`, secrets: [CODE, SIGNED_LOOKING_STATE] },
  { label: "code seul", qs: `?code=${encodeURIComponent(CODE)}`, secrets: [CODE] },
  { label: "state seul", qs: `?state=${OLD_STATE}`, secrets: [OLD_STATE] },
  { label: "erreur du fournisseur", qs: "?error=access_denied&error_description=The+user+denied+%3Cscript%3Ealert(1)%3C%2Fscript%3E", secrets: ["access_denied", "<script>", "denied"] },
  { label: "paramètres très longs", qs: `?user_id=${"a".repeat(5000)}&state=${"b".repeat(5000)}&code=${"c".repeat(5000)}`, secrets: ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"] },
];

const FORBIDDEN_IN_BODY = [
  "accounts.google.com", "login.microsoftonline.com", "googleapis", "graph.microsoft.com",
  "supabase", "token", "refresh", "Error", "undefined", "null", "${", "<script",
  ...Object.values(FAKE_ENV),
];

async function call(r: RouteCase, method: string, qs: string): Promise<Response> {
  const handler = r.mod[method] as Handler | undefined;
  assert.ok(typeof handler === "function", `${r.file} : ${method} exporté`);
  const req = new Request(`https://paipers.vercel.app${r.path}${qs}`, {
    method,
    headers: { Cookie: `sb-access-token=${VICTIM}; next-auth.session-token=fake`, Referer: "https://evil.invalid/" },
  });
  // Next.js transmet la requête ; le gestionnaire ne la lit pas (aucun paramètre déclaré).
  return handler(req);
}

async function assertRefusal(res: Response, r: RouteCase, label: string, secrets: string[]) {
  assert.equal(res.status, 410, `${r.file} (${label}) : statut 410`);
  assert.equal(res.headers.get("location"), null, `${r.file} (${label}) : aucune redirection`);
  assert.match(res.headers.get("content-type") || "", /^text\/html/, `${r.file} (${label}) : page HTML`);
  assert.equal(res.headers.get("cache-control"), "no-store", `${r.file} (${label}) : non mis en cache`);
  assert.equal(res.headers.get("referrer-policy"), "no-referrer", `${r.file} (${label}) : aucun référent transmis`);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.ok((res.headers.get("content-security-policy") || "").includes("default-src 'none'"));
  assert.equal(res.headers.get("set-cookie"), null, `${r.file} (${label}) : aucun cookie posé`);
  const body = await res.text();
  assert.equal(body, legacyOAuthRefusalHtml(r.provider === "Gmail" ? "gmail" : "outlook"), `${r.file} (${label}) : page neutre fixe`);
  assert.ok(body.includes(`Connexion ${r.provider} temporairement indisponible`));
  assert.ok(body.includes("en cours de sécurisation"));
  assert.ok(body.includes("déjà connectées continuent de fonctionner"));
  for (const s of [...secrets, ...FORBIDDEN_IN_BODY]) {
    assert.ok(!body.includes(s), `${r.file} (${label}) : la page ne contient pas « ${s.slice(0, 40)} »`);
  }
}

type T = { name: string; fn: () => Promise<void> };
const tests: T[] = [];
const test = (name: string, fn: () => Promise<void>) => tests.push({ name, fn });

for (const r of ROUTES) {
  test(`${r.file} — gestionnaire GET sans paramètre déclaré (la requête n'est pas lue)`, async () => {
    const handler = r.mod.GET as Handler;
    assert.equal(handler.length, 0);
    const exported = Object.keys(r.mod).filter((k) => k !== "default").sort();
    assert.deepEqual(exported, ["GET"], `${r.file} : seul GET est exporté`);
  });
  for (const q of QUERIES) {
    test(`${r.file} — ${q.label} → 410, page neutre, aucune fuite`, async () => {
      const before = fetchCalls.length;
      const res = await call(r, "GET", q.qs);
      await assertRefusal(res, r, q.label, q.secrets);
      assert.equal(fetchCalls.length, before, "aucun appel réseau");
    });
  }
  test(`${r.file} — 5 appels répétés identiques → toujours 410, aucun effet`, async () => {
    const before = fetchCalls.length;
    const bodies = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const res = await call(r, "GET", `?code=${encodeURIComponent(CODE)}&state=${OLD_STATE}&user_id=${VICTIM}`);
      assert.equal(res.status, 410);
      bodies.add(await res.text());
    }
    assert.equal(bodies.size, 1, "réponse identique à chaque appel");
    assert.equal(fetchCalls.length, before);
  });
}

test("Aucun appel réseau sur l'ensemble des tests", async () => {
  assert.deepEqual(fetchCalls, []);
});

// --- Garde-fous statiques (commentaires retirés) ---
function code(path: string): string {
  return readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}
const APP_AUTH = join(__dirname, "../../../app/auth");
const FORBIDDEN_CODE = [
  /\bfetch\s*\(/, /createClient/, /supabase/i, /upsert/i, /\.redirect\s*\(/, /NextResponse/, /searchParams/,
  /OAuthState/, /googleapis|accounts\.google|microsoftonline|graph\.microsoft/, /process\.env/, /cookies\s*\(/,
  /refresh_token|access_token/, /oauthSuccessHtml|upsertEmailConnection|gmailOAuthEnv|gmailScopes/,
];

test("Statique — chaque route n'importe que le module de refus et ne contient aucun appel sensible", async () => {
  for (const r of ROUTES) {
    const src = code(join(APP_AUTH, r.file));
    const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
    assert.deepEqual(imports, ["@/lib/server/oauth/legacyRefusal"], `${r.file} : une seule dépendance`);
    for (const re of FORBIDDEN_CODE) assert.ok(!re.test(src), `${r.file} : motif interdit ${re}`);
    const provider = r.provider === "Gmail" ? "gmail" : "outlook";
    assert.ok(src.includes(`legacyOAuthRefusalResponse("${provider}")`), `${r.file} : bon fournisseur`);
  }
});

test("Statique — le module de refus n'importe rien et ne fait aucun appel", async () => {
  const src = code(join(__dirname, "legacyRefusal.ts"));
  assert.ok(!/\bimport\b/.test(src), "aucun import");
  for (const re of FORBIDDEN_CODE) assert.ok(!re.test(src), `legacyRefusal.ts : motif interdit ${re}`);
});

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
  console.log(`\n[verify-oauth-killswitch] ${passed}/${tests.length} tests réussis — appels réseau : ${fetchCalls.length}`);
  if (failures.length) {
    console.log(`[verify-oauth-killswitch] ÉCHECS : ${failures.length}`);
    process.exit(1);
  }
})();
