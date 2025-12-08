"use client";

import { useState } from "react";
import { Sparkles, FileText } from "lucide-react";

export default function GenererPage() {
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
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

    const response = await fetch("/api/generate-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, details }),
    });

    const data = await response.json();

    setLoading(false);

    if (data.error) {
      alert("Erreur : " + data.error);
      return;
    }

    setResult(data.text);
  };

  return (
    <div className="px-6 pt-14 pb-24">

      {/* TITRE */}
      <h1 className="text-3xl font-bold mb-1">Générer un document</h1>
      <p className="text-slate-500 mb-8">
        Créez des documents administratifs avec l’IA
      </p>

      {/* BLOC PRINCIPAL */}
      <div className="card p-6 flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))]/20 flex items-center justify-center">
            <Sparkles className="text-[hsl(var(--primary))]" size={26} />
          </div>

          <div>
            <h3 className="text-lg font-semibold">Génération intelligente</h3>
            <p className="text-slate-500 text-sm">
              L’IA génère pour vous des documents administratifs personnalisés.
            </p>
          </div>
        </div>

        {/* SELECT */}
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

        {/* CHAMP LIBRE */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Décrivez votre situation
          </label>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-[hsl(0_0%_97%)] text-slate-700 outline-none"
            placeholder="Exemple : Je souhaite résilier mon abonnement Internet Orange car je déménage..."
          />
        </div>

        {/* BOUTON */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 rounded-full bg-[hsl(var(--primary))] text-white font-semibold text-[17px] flex items-center justify-center gap-2 active:scale-[0.97] transition disabled:opacity-50"
        >
          <FileText size={20} />
          {loading ? "Génération..." : "Générer le document"}
        </button>
      </div>

      {/* RESULTAT */}
      {result && (
        <div className="card p-6 mt-6 whitespace-pre-wrap text-sm text-slate-800">
          {result}
        </div>
      )}
    </div>
  );
}
