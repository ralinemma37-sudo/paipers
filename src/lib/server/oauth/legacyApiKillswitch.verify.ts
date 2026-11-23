/**
 * SEC-1C (complément, 23/11/2026) — Tests du verrou des anciennes routes Gmail / NextAuth :
 *   /api/gmail/auth (GET), /api/gmail/callback (GET), /api/google/save-connection (POST),
 *   /api/auth/[...nextauth] (GET + POST).
 * Exécution : tsx src/lib/server/oauth/legacyApiKillswitch.verify.ts
 *
 * Les VRAIS gestionnaires sont appelés avec de vraies requêtes (user_id libre, state non signé, code OAuth,
 * corps JSON visant un tiers, cookies de session, routes NextAuth signin/callback/session).
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
  GOOGLE_GMAIL_REDIRECT_URI: "https://example.invalid/api/gmail/callback",
  NEXTAUTH_SECRET: "fake-nextauth-secret-XYZ",
  NEXTAUTH_URL: "https://example.invalid",
  NEXT_PUBLIC_SUPABASE_URL: "https://fake-project.invalid",
  SUPABASE_URL: "https://fake-project.invalid",
  SUPABASE_SERVICE_ROLE_KEY: "fake-service-role-key-XYZ",
};
Object.assign(process.env, FAKE_ENV);

import * as gmailAuth from "@/app/api/gmail/auth/route";
import * as gmailCallback from "@/app/api/gmail/callback/route";
import * as saveConnection from "@/app/api/google/save-connection/route";
import * as nextAuth from "@/app/api/auth/[...nextauth]/route";
import { legacyOAuthRefusalHtml } from "@/lib/server/oauth/legacyRefusal";

type Handler = (req?: Request) => Promise<Response>;
type RouteCase = { file: string; path: string; methods: string[]; mod: Record<string, unknown> };

// Méthodes exposées AVANT le verrou (d1d899a) — les mêmes restent exportées, toutes refusées.
const ROUTES: RouteCase[] = [
  { file: "src/app/api/gmail/auth/route.ts", path: "/api/gmail/auth", methods: ["GET"], mod: gmailAuth },
  { file: "src/app/api/gmail/callback/route.ts", path: "/api/gmail/callback", methods: ["GET"], mod: gmailCallback },
  { file: "src/app/api/google/save-connection/route.ts", path: "/api/google/save-connection", methods: ["POST"], mod: saveConnection },
  { file: "src/app/api/auth/[...nextauth]/route.ts", path: "/api/auth", methods: ["GET", "POST"], mod: nextAuth },
];

// --- Données synthétiques ---
const VICTIM = "00000000-0000-4000-8000-0000000000a1";
const ATTACKER = "00000000-0000-4000-8000-0000000000b2";
const CODE = "4/0AQSTgQ-FAKE-AUTH-CODE-1234567890";
const OLD_STATE = encodeURIComponent(JSON.stringify({ platform: "mobile", userId: VICTIM }));
const FORGED_STATE = encodeURIComponent(JSON.stringify({ platform: "web", userId: ATTACKER }));
const SESSION_JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2aWN0aW0ifQ.ZmF1c3NlLXNpZ25hdHVyZQ";

const SUFFIXES: Array<{ label: string; sub: string; qs: string; secrets: string[] }> = [
  { label: "sans paramètre", sub: "", qs: "", secrets: [] },
  { label: "user_id libre", sub: "", qs: `?user_id=${VICTIM}&platform=mobile`, secrets: [VICTIM] },
  { label: "code + ancien state non signé", sub: "", qs: `?code=${encodeURIComponent(CODE)}&state=${OLD_STATE}`, secrets: [CODE, VICTIM] },
  { label: "code + state falsifié", sub: "", qs: `?code=${encodeURIComponent(CODE)}&state=${FORGED_STATE}`, secrets: [CODE, ATTACKER] },
  { label: "erreur du fournisseur", sub: "", qs: "?error=access_denied&error_description=%3Cscript%3Ealert(1)%3C%2Fscript%3E", secrets: ["access_denied", "<script>"] },
  { label: "NextAuth signin Google", sub: "/signin/google", qs: "?callbackUrl=https%3A%2F%2Fevil.invalid", secrets: ["evil.invalid"] },
  { label: "NextAuth callback Google", sub: "/callback/google", qs: `?code=${encodeURIComponent(CODE)}&state=abc`, secrets: [CODE] },
  { label: "NextAuth session", sub: "/session", qs: "", secrets: [] },
  { label: "NextAuth csrf / providers", sub: "/csrf", qs: "", secrets: ["csrfToken"] },
  { label: "paramètres très longs", sub: "", qs: `?user_id=${"a".repeat(5000)}&state=${"b".repeat(5000)}&code=${"c".repeat(5000)}`, secrets: ["aaaaaaaaaa", "bbbbbbbbbb", "cccccccccc"] },
];

const BODIES: Array<{ label: string; body: string; secrets: string[] }> = [
  { label: "corps vide", body: "", secrets: [] },
  { label: "user_id d'un tiers", body: JSON.stringify({ user_id: VICTIM }), secrets: [VICTIM] },
  { label: "user_id + jetons fournis", body: JSON.stringify({ user_id: ATTACKER, access_token: "ya29.FAKE", refresh_token: "1//FAKE-REFRESH" }), secrets: [ATTACKER, "ya29.FAKE", "1//FAKE-REFRESH"] },
  { label: "JSON invalide", body: "{user_id:", secrets: [] },
];

const FORBIDDEN_IN_BODY = [
  "accounts.google.com", "login.microsoftonline.com", "googleapis", "oauth2",
  "supabase", "token", "refresh", "Error", "undefined", "null", "${", "<script", "next-auth", "csrf",
  ...Object.values(FAKE_ENV),
];

function makeRequest(r: RouteCase, method: string, sub: string, qs: string, body?: string): Request {
  return new Request(`https://paipers.vercel.app${r.path}${sub}${qs}`, {
    method,
    headers: {
      Cookie: `${SESSION_JWT}; sb-access-token=${VICTIM}; next-auth.session-token=${SESSION_JWT}; next-auth.csrf-token=abc`,
      Referer: "https://evil.invalid/",
      "Content-Type": "application/json",
    },
    body: method === "GET" ? undefined : body ?? "",
  });
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
  const text = await res.text();
  assert.equal(text, legacyOAuthRefusalHtml("gmail"), `${r.file} (${label}) : page neutre fixe`);
  assert.ok(text.includes("Connexion Gmail temporairement indisponible"));
  for (const s of [...secrets, ...FORBIDDEN_IN_BODY]) {
    assert.ok(!text.includes(s), `${r.file} (${label}) : la page ne contient pas « ${s.slice(0, 40)} »`);
  }
}

type T = { name: string; fn: () => Promise<void> };
const tests: T[] = [];
const test = (name: string, fn: () => Promise<void>) => tests.push({ name, fn });

for (const r of ROUTES) {
  test(`${r.path} — méthodes exportées = ${r.methods.join(" + ")}, sans paramètre (la requête n'est pas lue)`, async () => {
    const exported = Object.keys(r.mod).filter((k) => k !== "default").sort();
    assert.deepEqual(exported, [...r.methods].sort(), `${r.file} : méthodes exportées`);
    for (const m of r.methods) assert.equal((r.mod[m] as Handler).length, 0, `${r.file} : ${m} sans paramètre`);
  });

  for (const m of r.methods) {
    if (m === "GET") {
      for (const s of SUFFIXES) {
        test(`${r.path} GET — ${s.label} → 410, page neutre, aucune fuite`, async () => {
          const before = fetchCalls.length;
          const res = await (r.mod.GET as Handler)(makeRequest(r, "GET", s.sub, s.qs));
          await assertRefusal(res, r, s.label, s.secrets);
          assert.equal(fetchCalls.length, before, "aucun appel réseau");
        });
      }
    } else {
      for (const b of BODIES) {
        test(`${r.path} ${m} — ${b.label} → 410, corps non lu, aucune fuite`, async () => {
          const before = fetchCalls.length;
          const req = makeRequest(r, m, r.path === "/api/auth" ? "/callback/google" : "", "", b.body);
          const res = await (r.mod[m] as Handler)(req);
          await assertRefusal(res, r, b.label, b.secrets);
          assert.equal(req.bodyUsed, false, "le corps de la requête n'est pas lu");
          assert.equal(fetchCalls.length, before, "aucun appel réseau");
        });
      }
    }
  }

  test(`${r.path} — 5 appels répétés → toujours 410, réponse identique, aucun effet`, async () => {
    const before = fetchCalls.length;
    const bodies = new Set<string>();
    for (let i = 0; i < 5; i++) {
      for (const m of r.methods) {
        const res = await (r.mod[m] as Handler)(
          makeRequest(r, m, "", `?code=${encodeURIComponent(CODE)}&state=${OLD_STATE}&user_id=${VICTIM}`, JSON.stringify({ user_id: VICTIM })),
        );
        assert.equal(res.status, 410);
        bodies.add(await res.text());
      }
    }
    assert.equal(bodies.size, 1);
    assert.equal(fetchCalls.length, before);
  });
}

test("Aucun appel réseau sur l'ensemble des tests", async () => {
  assert.deepEqual(fetchCalls, []);
});

// --- Garde-fous statiques (commentaires retirés) ---
const code = (path: string) =>
  readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const ROOT = join(__dirname, "../../../..");

const FORBIDDEN_IN_SOURCE: Array<[RegExp, string]> = [
  [/@supabase\//, "client Supabase"],
  [/next-auth/, "NextAuth"],
  [/\bfetch\s*\(/, "appel réseau"],
  [/searchParams|nextUrl|\.json\s*\(|\.text\s*\(|\.formData\s*\(|cookies\s*\(|headers\s*\(|\.cookies\b|\.headers\b/, "lecture de la requête"],
  [/redirect/i, "redirection"],
  [/process\.env/, "variable d'environnement"],
  [/user_id|userId|state|code\b/, "identifiant, state ou code"],
  [/accounts\.google|googleapis|microsoftonline|oauth2/, "fournisseur OAuth"],
  [/\.from\s*\(|\.insert\s*\(|\.update\s*\(|\.upsert\s*\(|\.delete\s*\(/, "écriture en base"],
];

for (const r of ROUTES) {
  test(`Statique — ${r.file} : n'importe que le module de refus`, async () => {
    const src = code(join(ROOT, r.file));
    const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((x) => x[1]);
    assert.deepEqual(imports, ["@/lib/server/oauth/legacyRefusal"], `${r.file} : imports`);
    for (const [re, what] of FORBIDDEN_IN_SOURCE) assert.ok(!re.test(src), `${r.file} : aucun(e) ${what}`);
    assert.equal(
      [...src.matchAll(/legacyOAuthRefusalResponse\("gmail"\)/g)].length,
      r.methods.length,
      `${r.file} : chaque méthode renvoie le refus`,
    );
  });
}

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
  console.log(`\n[verify-legacy-api-killswitch] ${ok}/${tests.length} tests réussis — appels réseau : ${fetchCalls.length}`);
  if (ok !== tests.length) process.exit(1);
})();
