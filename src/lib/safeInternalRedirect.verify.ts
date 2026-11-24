/**
 * SEC-LOGIN-NEXT (phase 2B, 24/11/2026) — destination après connexion de l'ancienne page /login.
 * Chaque valeur acceptée est aussi résolue comme le ferait le navigateur (WHATWG URL) : elle doit rester sur le site.
 * Données fictives, aucun réseau. Lancer : npx tsx src/lib/safeInternalRedirect.verify.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SAFE_REDIRECT_DEFAULT, safeInternalRedirect } from "@/lib/safeInternalRedirect";

const ORIGIN = "https://www.plaidoc.fr";
const D = SAFE_REDIRECT_DEFAULT;
let ok = 0;
const check = (label: string, raw: string | null | undefined, expected: string) => {
  const out = safeInternalRedirect(raw);
  assert.equal(out, expected, `${label} : ${JSON.stringify(raw)} → ${JSON.stringify(out)}`);
  assert.equal(new URL(out, `${ORIGIN}/login`).origin, ORIGIN, `${label} : destination hors du site`);
  ok += 1;
};

// Parcours légitimes conservés.
check("sans destination", null, D);
check("vide", "", D);
check("assistant", "/assistant", "/assistant");
check("admin waitlist (destination admin autorisée)", "/admin/waitlist", "/admin/waitlist");
check("document avec id", "/documents/view?id=00000000-0000-4000-8000-000000000001", "/documents/view?id=00000000-0000-4000-8000-000000000001");
check("document à signer", "/documents/view?id=00000000-0000-4000-8000-000000000001&sign=1", "/documents/view?id=00000000-0000-4000-8000-000000000001&sign=1");
check("factures section", "/factures?section=generer", "/factures?section=generer");
check("profil sous-page", "/profil/parametres", "/profil/parametres");
check("catégorie", "/documents/factures", "/documents/factures");
check("espace encodé %20 dans la requête", "/documents?q=a%20b", "/documents?q=a%20b");

// Adresses externes.
for (const raw of ["https://evil.example", "http://evil.example/assistant", "//evil.example", "///evil.example", "javascript:alert(1)", "data:text/html,x", "evil.example/assistant", "mailto:a@exemple.invalid"]) {
  check("externe", raw, D);
}
// Antislashs (lus comme « / » par le navigateur).
for (const raw of ["/\\evil.example", "/\\\\evil.example", "//\\evil.example", "/assistant\\..\\..\\evil", "\\/evil.example"]) {
  check("antislash", raw, D);
}
// Caractères de contrôle et espaces (retirés par le navigateur).
for (const raw of ["/\t/evil.example", "/\n/evil.example", "/\r/evil.example", "/\u0000/evil.example", "/\u007f/evil", " /assistant", "/assistant ", "/ /evil.example", "/\u0085/evil"]) {
  check("contrôle / espace", raw, D);
}
// Encodages simples et doubles.
for (const raw of ["/%2F%2Fevil.example", "/%2f/evil.example", "/%5Cevil.example", "/%252F%252Fevil.example", "/%255Cevil", "/%2e%2e/evil", "/assistant/%2E%2E/x", "/%09/evil.example", "/%0a/evil", "/%7f"]) {
  check("encodage", raw, D);
}
// Chemins relatifs ou ambigus.
for (const raw of ["assistant", "./assistant", "../assistant", "/assistant/../evil", "/assistant/./x", "/./assistant", "/admin/../login", "/documents/..", "?next=/x", "#x"]) {
  check("relatif / ambigu", raw, D);
}
// Pages publiques ou inconnues : jamais visées par une reprise après connexion.
for (const raw of ["/", "/login", "/signup", "/api/gmail/scan", "/auth/gmail", "/app", "/app/login", "/legal/cgu", "/waitlist/confirm", "/assistantx", "/adminx", "/admin-waitlist"]) {
  check("hors pages privées", raw, D);
}
// Longueur.
check("trop long", "/assistant?x=" + "a".repeat(2100), D);
check("non textuel", undefined, D);

// Paramètres multiples : la page lit le premier « next », puis « redirect » seulement si « next » est absent.
const pick = (qs: string) => {
  const sp = new URLSearchParams(qs);
  return safeInternalRedirect(sp.get("next") ?? sp.get("redirect"));
};
assert.equal(pick("next=/admin/waitlist&next=%2F%5Cevil.example"), "/admin/waitlist"); ok += 1;
assert.equal(pick("next=%2F%5Cevil.example&next=/admin/waitlist"), D); ok += 1;
assert.equal(pick("next=%2F%5Cevil.example&redirect=/assistant"), D, "un next invalide ne retombe pas sur redirect"); ok += 1;
assert.equal(pick("redirect=/documents"), "/documents"); ok += 1;
assert.equal(pick("redirect=%2F%09%2Fevil.example"), D); ok += 1;
assert.equal(pick("next=%252F%252Fevil.example"), D, "double encodage dans la requête"); ok += 1;
assert.equal(pick("next=/admin/waitlist%3Fx%3D1"), "/admin/waitlist?x=1"); ok += 1;

// Code branché : la page de connexion utilise la version stricte, sans copie locale.
const page = readFileSync(join(__dirname, "../app/login/page.tsx"), "utf8");
assert.ok(page.includes('import { safeInternalRedirect } from "@/lib/safeInternalRedirect";'));
assert.ok(!/function safeInternalRedirect/.test(page), "ancienne fonction encore présente dans la page");
assert.equal((page.match(/router\.replace\(safeInternalRedirect\(next\)\)/g) || []).length, 2);
ok += 1;

console.log(`[verify-safe-internal-redirect] ${ok} contrôles réussis`);
