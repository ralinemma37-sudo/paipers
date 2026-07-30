"use client";

/**
 * Rédiger un document — réf. RedigerDocumentFlow.tsx (situation libre + génération).
 * Appel : POST /api/generate-document (existant, non modifié).
 * Sauvegarde PDF : logique précédente de /generer (jsPDF + Storage + documents).
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { buildLetterPdfBytes, slugify } from "@/lib/buildLetterPdf";
import {
  inferWebGenerateType,
  titleForGenerateType,
  type WebGenerateType,
} from "@/lib/inferWebGenerateType";
import { supabase } from "@/lib/supabase";
import {
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  PAIPERS_RADIUS,
  PAIPERS_SPACE,
  gradientCss,
} from "@/lib/paipersTheme";

export default function RedigerDocumentPage() {
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState("");
  const [editableText, setEditableText] = useState("");
  const [docType, setDocType] = useState<WebGenerateType>("lettre_simple");
  const [saving, setSaving] = useState(false);
  const [uiMsg, setUiMsg] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  const docTitle = titleForGenerateType(docType);

  const handleGenerate = async () => {
    setErrorMsg("");
    setUiMsg("");
    setSavedOk(false);

    if (!situation.trim()) {
      setErrorMsg("Décrivez votre situation pour commencer.");
      return;
    }

    const type = inferWebGenerateType(situation);
    setDocType(type);
    setLoading(true);
    setResult("");
    setEditableText("");

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details: situation.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (!response.ok || data?.error) {
        setErrorMsg(
          typeof data?.error === "string" && data.error.trim()
            ? data.error
            : "Génération impossible pour le moment.",
        );
        return;
      }

      const text = (data.text || "").toString();
      if (!text.trim()) {
        setErrorMsg("Génération impossible pour le moment.");
        return;
      }
      setResult(text);
      setEditableText(text);
    } catch (e: unknown) {
      setLoading(false);
      const msg = e instanceof Error ? e.message : "inconnue";
      setErrorMsg(`Erreur réseau : ${msg}`);
    }
  };

  const handleSaveToDocuments = async () => {
    setUiMsg("");
    setSaving(true);
    setSavedOk(false);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        setSaving(false);
        setUiMsg("Connecte-toi pour enregistrer le document.");
        return;
      }

      const content = (editableText || result || "").trim();
      if (!content) {
        setSaving(false);
        setUiMsg("Rien à enregistrer pour le moment.");
        return;
      }

      const date = new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const safeTitle = slugify(docTitle) || "document";
      const filename = `${safeTitle}-${y}${m}${d}.pdf`;
      const pdfBytes = buildLetterPdfBytes(docTitle, content);
      const filePath = `${user.id}/generated/${Date.now()}-${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, pdfBytes, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        setSaving(false);
        setUiMsg(`Erreur upload : ${uploadError.message}`);
        return;
      }

      const { error: insertError } = await supabase.from("documents").insert({
        user_id: user.id,
        title: docTitle,
        original_filename: filename,
        category: "autres",
        source: "ai",
        file_path: filePath,
        mime_type: "application/pdf",
        is_ready: true,
        needs_review: false,
        metadata: { generated: true },
      });

      if (insertError) {
        setSaving(false);
        setUiMsg(`Erreur enregistrement : ${insertError.message}`);
        return;
      }

      setSaving(false);
      setSavedOk(true);
      setUiMsg("Copie PDF enregistrée dans tes documents.");
    } catch (e: unknown) {
      setSaving(false);
      const msg = e instanceof Error ? e.message : "inconnue";
      setUiMsg(`Erreur : ${msg}`);
    }
  };

  const resetAll = () => {
    setSituation("");
    setResult("");
    setEditableText("");
    setErrorMsg("");
    setUiMsg("");
    setSavedOk(false);
  };

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 900 }}
        >
          <Link
            href="/generer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#64748b",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <ChevronLeft size={18} />
            Retour
          </Link>

          <h1 className="paipers-screen-title" style={{ marginBottom: 8 }}>
            Rédiger un document
          </h1>
          <p className="paipers-text-muted" style={{ marginBottom: 22, fontSize: 14 }}>
            Laissez Paipers rédiger vos documents grâce à l&apos;IA. Courriers, contrats, dossiers
            complets.
          </p>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="paipers-elevated-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label
                  htmlFor="situation"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  Votre situation
                </label>
                <textarea
                  id="situation"
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  rows={5}
                  disabled={loading}
                  placeholder="Décrivez votre situation en une phrase ou deux…"
                  style={{
                    width: "100%",
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                    borderRadius: 16,
                    padding: "14px 16px",
                    fontSize: 15,
                    lineHeight: "22px",
                    fontFamily: "inherit",
                    color: PAIPERS_COLORS.textPrimary,
                    resize: "vertical",
                    outline: "none",
                    background: "#fff",
                  }}
                />

                {errorMsg ? (
                  <p
                    role="alert"
                    style={{ color: "#B91C1C", fontSize: 14, fontWeight: 600, margin: 0 }}
                  >
                    {errorMsg}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handleGenerate()}
                  disabled={loading}
                  style={{
                    padding: "14px 16px",
                    borderRadius: PAIPERS_RADIUS.button,
                    border: "none",
                    background: PAIPERS_COLORS.navy,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 16,
                    cursor: loading ? "wait" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "…" : "Créer le document"}
                </button>

                {loading ? (
                  <p
                    className="paipers-text-muted"
                    style={{ margin: 0, fontSize: 14, textAlign: "center" }}
                    aria-live="polite"
                  >
                    Paipers rédige votre document…
                  </p>
                ) : null}
              </div>
            </div>

            {(result || editableText) && !loading ? (
              <div
                className="paipers-elevated-card"
                style={{
                  flex: 1.1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <h2
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {docTitle}
                </h2>
                <p className="paipers-text-muted" style={{ margin: 0, fontSize: 13 }}>
                  Modifier la lettre manuellement
                </p>
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  rows={16}
                  aria-label="Lettre générée"
                  style={{
                    width: "100%",
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                    borderRadius: 16,
                    padding: "14px 16px",
                    fontSize: 14,
                    lineHeight: "22px",
                    fontFamily: "inherit",
                    color: PAIPERS_COLORS.textPrimary,
                    resize: "vertical",
                    outline: "none",
                    whiteSpace: "pre-wrap",
                  }}
                />

                <button
                  type="button"
                  onClick={() => void handleSaveToDocuments()}
                  disabled={saving}
                  style={{
                    padding: "14px 16px",
                    borderRadius: PAIPERS_RADIUS.button,
                    border: "none",
                    backgroundImage: gradientCss(PAIPERS_GRADIENTS.button, 90),
                    color: PAIPERS_COLORS.textPrimary,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: saving ? "wait" : "pointer",
                    opacity: saving ? 0.6 : 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Save size={18} />
                  {saving ? "Enregistrement…" : "Enregistrer une copie PDF"}
                </button>

                {uiMsg ? (
                  <p
                    className="paipers-text-muted"
                    style={{ margin: 0, fontSize: 13 }}
                    role="status"
                  >
                    {uiMsg}
                  </p>
                ) : null}

                {savedOk ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link
                      href="/documents"
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: PAIPERS_COLORS.navy,
                      }}
                    >
                      Voir dans mes documents
                    </Link>
                    <button
                      type="button"
                      onClick={resetAll}
                      style={{
                        padding: "12px 16px",
                        borderRadius: PAIPERS_RADIUS.button,
                        border: `1px solid ${PAIPERS_COLORS.border}`,
                        background: "#fff",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Créer un autre document
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
