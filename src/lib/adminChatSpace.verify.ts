/**
 * Lot Archi « espace actif » — assistant web (/assistant).
 * npx tsx src/lib/adminChatSpace.verify.ts
 *
 * Réponses simulées : ancien contrat (admin-chat v37 en production, ignore `space`, pas de `document_scope`)
 * et nouveau contrat (paipers-mobile 28344650 : `document_scope`, `document_scope_unavailable`).
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  WEB_SCOPE_LOADING_TEXT,
  WEB_SCOPE_UNKNOWN_TEXT,
  WEB_SCOPE_UNSUPPORTED_TEXT,
  buildWebAdminChatBody,
  finalizeWebAdminChatReply,
  sendWebAdminChatGuarded,
  webAdminChatSpaceState,
  webTransitionDecision,
  type WebAdminChatBody,
  type WebAdminChatInvoke,
} from "./adminChatSpace";

const ID_PERSO = "00000000-0000-4000-8000-000000000001";
const ID_PRO = "00000000-0000-4000-8000-000000000002";

// ——— Espace confirmé par NavSpaceProvider ———
assert.deepEqual(webAdminChatSpaceState({ loaded: false, confirmedScope: "pro" }), { status: "loading" });
assert.deepEqual(webAdminChatSpaceState({ loaded: true, confirmedScope: "personal" }), { status: "ready", space: "personal" });
assert.deepEqual(webAdminChatSpaceState({ loaded: true, confirmedScope: "pro" }), { status: "ready", space: "professional" });
assert.deepEqual(webAdminChatSpaceState({ loaded: true, confirmedScope: null }), { status: "unknown" }, "première ouverture : rien de confirmé");
assert.deepEqual(webAdminChatSpaceState({ loaded: true, confirmedScope: "family" }), { status: "unsupported" });
assert.deepEqual(webAdminChatSpaceState({ loaded: true, confirmedScope: "n'importe quoi" }), { status: "unknown" });

// Corps : jamais de Perso par défaut.
assert.equal("space" in buildWebAdminChatBody({ message: "m", state: { status: "unknown" } }), false);
assert.equal(buildWebAdminChatBody({ message: "m", state: { status: "ready", space: "professional" } }).space, "professional");

// Décisions (le site n'envoie pas d'intention : le serveur classe le message seul).
assert.equal(webTransitionDecision({ message: "Bonjour" }).send, true);
assert.equal(webTransitionDecision({ message: "Retrouve ma facture Orange de novembre" }).send, false);
assert.equal(webTransitionDecision({ message: "Bonjour", documentId: ID_PRO }).send, false);
assert.equal(webTransitionDecision({ message: "Que dit le document ?" }).send, false);
assert.equal(webTransitionDecision({ message: "La taxe foncière, c'est quoi ?" }).send, true);

// ——— Réponses simulées ———
type Contract = "ancien" | "nouveau";
function fakeServer(contract: Contract) {
  const calls: WebAdminChatBody[] = [];
  const invoke: WebAdminChatInvoke = async (body) => {
    calls.push(body);
    const isDocSearch = /facture/i.test(body.message) || Boolean(body.document_id);
    if (!isDocSearch) return { data: { success: true, intent: "unknown_fallback", answer: "Bonjour ! Comment puis-je t’aider ?" }, error: null };
    if (contract === "ancien") {
      // v37 : ignore space, cherche dans tous les espaces, pas de document_scope.
      return { data: { success: true, intent: "user_document_search", answer: "Voici ta facture.", document_ids: [ID_PERSO, ID_PRO] }, error: null };
    }
    if (!body.space) {
      return { data: { success: true, intent: "document_scope_unavailable", answer: "…Mets l’application à jour…", document_ids: [] }, error: null };
    }
    const id = body.space === "professional" ? ID_PRO : ID_PERSO;
    return { data: { success: true, intent: "user_document_search", answer: "Voici ta facture.", document_ids: [id], document_scope: body.space }, error: null };
  };
  return { calls, invoke };
}

async function ask(srv: ReturnType<typeof fakeServer>, message: string, state: ReturnType<typeof webAdminChatSpaceState>, documentId?: string) {
  const r = await sendWebAdminChatGuarded({ message, documentId, state, invoke: srv.invoke });
  if (r.kind === "blocked") return { blocked: true as const, answer: r.text, documentIds: [] as string[] };
  const payload = r.data as Record<string, unknown>;
  const fin = finalizeWebAdminChatReply({
    payload,
    state,
    sentSpace: r.sentSpace,
    serverAnswer: String(payload.answer),
    documentIds: (payload.document_ids as string[]) ?? [],
  });
  return { blocked: false as const, ...fin };
}

void (async () => {
  for (const contract of ["ancien", "nouveau"] as const) {
    const srv = fakeServer(contract);
    const loading = webAdminChatSpaceState({ loaded: false, confirmedScope: null });
    const unknown = webAdminChatSpaceState({ loaded: true, confirmedScope: null });
    const perso = webAdminChatSpaceState({ loaded: true, confirmedScope: "personal" });
    const pro = webAdminChatSpaceState({ loaded: true, confirmedScope: "pro" });

    // Chargement : pièce jointe et recherche bloquées, aucune requête.
    const pj = await ask(srv, "Résume ce document", loading, ID_PRO);
    assert.equal(pj.blocked, true, `${contract} : pièce jointe pendant le chargement`);
    assert.equal(pj.answer, WEB_SCOPE_LOADING_TEXT);
    assert.equal((await ask(srv, "Retrouve ma facture Orange de novembre", loading)).blocked, true);
    // Première ouverture sans espace confirmé : bloqué, message « choisis ton espace ».
    const first = await ask(srv, "Retrouve ma facture Orange de novembre", unknown);
    assert.equal(first.blocked, true);
    assert.equal(first.answer, WEB_SCOPE_UNKNOWN_TEXT);
    assert.equal(srv.calls.length, 0, `${contract} : aucune requête documentaire sans espace confirmé`);
    // Usage sans document : servi, sans espace.
    const hello = await ask(srv, "Bonjour", unknown);
    assert.equal(hello.blocked, false);
    assert.equal(srv.calls.length, 1);
    assert.equal("space" in srv.calls[0]!, false);
    // Famille : non pris en charge.
    const fam = await ask(srv, "Retrouve ma facture Orange", webAdminChatSpaceState({ loaded: true, confirmedScope: "family" }));
    assert.equal(fam.answer, WEB_SCOPE_UNSUPPORTED_TEXT);

    // Perso confirmé.
    const p = await ask(srv, "Retrouve ma facture Orange de novembre", perso);
    assert.equal(srv.calls.at(-1)!.space, "personal");
    // Pro confirmé.
    const q = await ask(srv, "Retrouve ma facture Orange de novembre", pro);
    assert.equal(srv.calls.at(-1)!.space, "professional");
    // Pièce jointe une fois l'espace confirmé : envoyée avec l'espace.
    await ask(srv, "Résume ce document", pro, ID_PRO);
    assert.equal(srv.calls.at(-1)!.space, "professional");
    assert.equal(srv.calls.at(-1)!.document_id, ID_PRO);

    if (contract === "nouveau") {
      assert.deepEqual(p.documentIds, [ID_PERSO], "nouveau : liens vers la pièce Perso");
      assert.deepEqual(q.documentIds, [ID_PRO], "nouveau : liens vers la pièce Pro");
    } else {
      // Ancien serveur : il ignore l'espace et mélange Perso/Pro → aucun lien affiché (comme l'appli mobile).
      assert.deepEqual(p.documentIds, []);
      assert.deepEqual(q.documentIds, []);
      assert.equal(p.answer, "Voici ta facture.");
    }
  }

  // Nouveau serveur qui ferme quand même (espace absent côté serveur) : message web, pas « mets à jour l'application ».
  const closed = finalizeWebAdminChatReply({
    payload: { intent: "document_scope_unavailable", answer: "…Mets l’application à jour…" },
    state: { status: "ready", space: "personal" },
    sentSpace: "personal",
    serverAnswer: "…Mets l’application à jour…",
    documentIds: [ID_PERSO],
  });
  assert.equal(closed.answer, WEB_SCOPE_UNKNOWN_TEXT);
  assert.deepEqual(closed.documentIds, []);
  // Réponse pour un autre espace que celui envoyé : pas de liens.
  assert.deepEqual(
    finalizeWebAdminChatReply({ payload: { document_scope: "professional" }, state: { status: "ready", space: "personal" }, sentSpace: "personal", serverAnswer: "x", documentIds: [ID_PRO] }).documentIds,
    [],
  );

  // ——— Code branché ———
  const root = join(__dirname, "../..");
  const mirror = readFileSync(join(root, "src/lib/adminChatIntentRouterMirror.ts"));
  assert.equal(
    createHash("sha256").update(mirror).digest("hex"),
    // supabase/functions/admin-chat/intentRouter.ts du dépôt paipers-mobile (commit a6d4925, identique à la v37).
    "64a673fa44ba30192e9c599260514a6f95f55a67c554527caada5f721fac26a5",
    "copie du routeur admin-chat désynchronisée",
  );
  const client = readFileSync(join(root, "src/lib/adminChat.ts"), "utf8");
  assert.equal((client.match(/functions\.invoke\("admin-chat", \{/g) || []).length, 1, "un seul appel admin-chat dans le code");
  assert.ok(/invoke: \(body\) => supabase\.functions\.invoke\("admin-chat", \{ body \}\)/.test(client), "seul envoi : dans le garde-fou");
  assert.ok(/if \(guarded\.kind === "blocked"\)/.test(client));
  assert.ok(/finalizeWebAdminChatReply\(\{/.test(client));
  const page = readFileSync(join(root, "src/app/assistant/page.tsx"), "utf8");
  assert.ok(/spaceState: webAdminChatSpaceState\(\{ loaded: spaceLoaded, confirmedScope \}\)/.test(page));
  assert.ok(/href=\{`\/documents\/view\?id=\$\{id\}`\}/.test(page), "liens d'ouverture des pièces conservés");
  const provider = readFileSync(join(root, "src/components/NavSpaceProvider.tsx"), "utf8");
  assert.ok(/setConfirmedScope\(raw === "personal" \|\| raw === "pro" \|\| raw === "family" \? raw : null\)/.test(provider));
  assert.ok(/setConfirmedScope\(next\)/.test(provider));

  console.log("[verify-web-admin-chat-space] OK");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
