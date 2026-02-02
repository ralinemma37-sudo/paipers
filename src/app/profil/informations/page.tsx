"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type ProfileRow = {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
};

export default function InformationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Champs profil
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setMessage("");
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        setLoading(false);
        setMessage("Vous devez être connectée.");
        return;
      }

      setEmail(user.email || "");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(
          "full_name,first_name,last_name,phone,address_line1,address_line2,postal_code,city,country"
        )
        .eq("id", user.id)
        .single();

      if (!error && profile) {
        const p = profile as ProfileRow;
        setFirstName(p.first_name || "");
        setLastName(p.last_name || "");
        setPhone(p.phone || "");
        setAddress1(p.address_line1 || "");
        setAddress2(p.address_line2 || "");
        setPostalCode(p.postal_code || "");
        setCity(p.city || "");
        setCountry(p.country || "");
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  async function handleSave() {
    setMessage("");
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      setSaving(false);
      setMessage("Vous devez être connectée.");
      return;
    }

    // On reconstruit full_name automatiquement (pratique pour l’accueil)
    const computedFullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: computedFullName || null,
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
      address_line1: address1 || null,
      address_line2: address2 || null,
      postal_code: postalCode || null,
      city: city || null,
      country: country || null,
    });

    if (error) {
      setMessage(`Erreur : ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Enregistré ✅");
    setSaving(false);
  }

  return (
    <Protected>
      <main className="px-6 py-6 pb-24">
        {/* Header avec flèche retour */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/profil"
            className="p-2 rounded-full active:scale-95 transition"
            aria-label="Retour au profil"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">
              Informations <span className="gradient-text">du profil</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Ces infos servent à pré-remplir tes documents (optionnel).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card p-4 text-slate-500">Chargement…</div>
        ) : (
          <div className="card p-5">
            {/* Email (lecture seule) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Email
              </label>
              <input
                value={email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              />
            </div>

            {/* Prénom / Nom */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Prénom
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex : Marie"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Nom
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex : Dupont"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Téléphone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex : 06 12 34 56 78"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            {/* Adresse */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Adresse (ligne 1)
              </label>
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Ex : 10 rue de la Paix"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Adresse (ligne 2) (optionnel)
              </label>
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Ex : Bâtiment A, appartement 12"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Code postal
                </label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Ex : 75001"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Ville
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex : Paris"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700">
                  Pays
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ex : France"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-4 text-sm text-slate-600">{message}</div>
            )}

            {/* Bouton */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-full px-4 py-3 text-white text-sm font-medium
                bg-gradient-to-r from-[hsl(202_100%_82%)]
                via-[hsl(328_80%_84%)]
                to-[hsl(39_100%_85%)]
                shadow-md active:scale-95 transition disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </main>
    </Protected>
  );
}
