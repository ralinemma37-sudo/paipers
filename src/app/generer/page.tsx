"use client";

import { useMemo, useState } from "react";
import { Sparkles, FileText, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9\-]/g, "");
}

function buildLetterPdfBytes(title: string, content: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Marges + mise en page lettre simple
  const marginLeft = 18;
  const marginTop = 18;
  const maxWidth = 210 - marginLeft * 2;

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  // Titre discret
  doc.text(title, marginLeft, marginTop);

  // Corps
  const lines = doc.splitTextToSize(content, maxWidth);
  doc.text(lines, marginLeft, marginTop + 10);

  // Retourne un Uint8Array (bytes) prêt à upload
  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}

export default function GenererPage() {
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [editableText, setEditableText] = useState("");

  const [saving, setSaving] = useState(false);
  const [uiMsg, setUiMsg] = useState<string>("");

  const docTitle = useMemo(() => {
    const map: Record<string, string> = {
      attestation_honneur: "Attestation sur l’honneur",
      attestation_hebergement: "Attestation d’hébergement",
      demission: "Lettre de démission",
      resiliation_internet: "Résiliation Internet",
      resiliation_assurance: "Résiliation assurance",
      lettre_simple: "Lettre simple",
      lettre_recommandee: "Lettre recommandée",
    };
    return map[type] || "Document";
  }, [type]);

  const handleGenerate = async () => {
    setUiMsg("");

    if (!type) {
      alert("Veuillez sélectionner un type de document.");
      return;
    }
    if (!details.trim()) {
      alert("Veuillez décrire votre situation.");
      return;
    }

    setLoading(true);
    setResult("");
    setEditableText("");

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details }),
      });

      const data = await response.json().catch(() => ({}));
      setLoading(false);

      if (!response.ok || data?.error) {
        alert("Erreur : " + (data?.error || "Erreur inconnue"));
        return;
      }

      const text = (data.text || "").toString();
      setResult(text);
      setEditableText(text);
    } catch (e: any) {
      setLoading(false);
      alert("Erreur réseau : " + (e?.message ?? "inconnue"));
    }
  };

  const handleSaveToDocuments = async () => {
    setUiMsg("");
    setSaving(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        setSaving(false);
        setUiMsg("Vous devez être connectée.");
        return;
      }

      const content = (editableText || result || "").trim();
      if (!content) {
        setSaving(false);
        setUiMsg("Rien à enregistrer pour le moment.");
        return;
      }

      // Nom fichier PDF
      const date = new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");

      const safeTitle = slugify(docTitle) || "document";
      const filename = `${safeTitle}-${y}${m}${d}.pdf`;

      // 1) Générer PDF (bytes)
      const pdfBytes = buildLetterPdfBytes(docTitle, content);

      // 2) Upload dans Storage
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

      // 3) Créer la ligne documents
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
      });

      if (insertError) {
        setSaving(false);
        setUiMsg(`Erreur enregistrement : ${insertError.message}`);
        return;
      }

      setSaving(false);
      window.location.href = "/documents";
    } catch (e: any) {
      setSaving(false);
      setUiMsg(`Erreur : ${e?.message ?? "inconnue"}`);
    }
  };

  return (
    <div className="px-6 pt-14 pb-24">
      <h1 className="text-3xl font-bold mb-1">Générer un document</h1>
      <p className="text-slate-500 mb-8">Créez des documents administratifs avec l’IA</p>

      <div className="card p-6 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))]/20 flex items-center justify-center">
            <Sparkles className="text-[hsl(var(--primary))]" size={26} />
          </div>

          <div>
            <h3 className="text-lg font-semibold">Génération intelligente</h3>
            <p className="text-slate-500 text-sm">
              L’IA génère un document prêt à enregistrer en PDF.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type de document</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-[hsl(0_0%_97%)] text-slate-700 outline-none"
          >
            <option value="">Sélectionner un type</option>
            <option value="attestation_honneur">Attestation sur l’honneur</option>
            <option value="attestation_hebergement">Attestation d’hébergement</option>
            <option value="demission">Lettre de démission</option>
            <option value="resiliation_internet">Résiliation Internet</option>
            <option value="resiliation_assurance">Résiliation assurance</option>
            <option value="lettre_simple">Lettre simple</option>
            <option value="lettre_recommandee">Lettre recommandée</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Décrivez votre situation</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-[hsl(0_0%_97%)] text-slate-700 outline-none"
            placeholder="Exemple : Je souhaite résilier mon abonnement Internet Orange car je déménage..."
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-full bg-[hsl(var(--primary))] text-white font-semibold text-[17px] flex items-center justify-center gap-2 active:scale-[0.97] transition disabled:opacity-50"
        >
          <FileText size={20} />
          {loading ? "Génération..." : "Générer le document"}
        </button>

        {uiMsg ? <p className="text-sm text-slate-500">{uiMsg}</p> : null}
      </div>

      {(result || editableText) && (
        <div className="card p-6 mt-6">
          <h3 className="text-lg font-semibold mb-1">{docTitle}</h3>
          <p className="text-slate-500 text-sm mb-4">
            Tu peux corriger le texte, puis l’enregistrer en PDF dans tes documents.
          </p>

          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            rows={14}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 outline-none whitespace-pre-wrap"
          />

          <button
            onClick={handleSaveToDocuments}
            disabled={saving}
            className="mt-4 w-full py-3 rounded-full text-white font-semibold text-[17px]
              bg-gradient-to-r from-[hsl(202_100%_82%)]
              via-[hsl(328_80%_84%)]
              to-[hsl(39_100%_85%)]
              shadow-md active:scale-[0.97] transition disabled:opacity-50
              flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? "Enregistrement..." : "Enregistrer en PDF dans mes documents"}
          </button>

          {uiMsg ? <p className="text-sm text-slate-500 mt-3">{uiMsg}</p> : null}
        </div>
      )}
    </div>
  );
}
