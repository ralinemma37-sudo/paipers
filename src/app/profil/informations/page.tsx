"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Camera, Trash2 } from "lucide-react";

export default function InformationsPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger profil
  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const u = auth.user;
      setUser(u);

      if (u) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();

        setProfile(p);
      }

      setLoading(false);
    };

    load();
  }, []);

  // ---------------------------
  //  UPLOAD AVATAR
  // ---------------------------
  const handleAvatar = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `avatars/${user.id}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("profiles")
      .upload(filePath, file);

    if (error) {
      alert("Erreur upload avatar : " + error.message);
      return;
    }

    // URL publique
    const publicUrl = supabase.storage
      .from("profiles")
      .getPublicUrl(filePath).data.publicUrl;

    // Mise à jour DB
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    // Mise à jour en live
    setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
  };

  if (loading)
    return <div className="p-6 text-slate-500">Chargement...</div>;

  return (
    <div className="px-6 py-10">

      {/* RETOUR */}
      <button onClick={() => router.push("/profil")} className="mb-6 text-[hsl(var(--primary))]">
        ← Retour
      </button>

      {/* TITRE */}
      <h1 className="text-3xl font-bold mb-2">Informations personnelles</h1>
      <p className="text-slate-500 mb-6">
        Gérez les informations associées à votre compte Paipers.
      </p>

      {/* AVATAR */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <img
            src={profile?.avatar_url || "/placeholder-avatar.jpg"}
            alt="avatar"
            className="w-28 h-28 rounded-full object-cover border border-[hsl(var(--border))]"
          />

          <label
            className="
              absolute bottom-0 right-0 
              bg-white dark:bg-[hsl(var(--muted))]
              p-2 rounded-full shadow cursor-pointer
            "
          >
            <Camera size={20} />
            <input type="file" className="hidden" onChange={handleAvatar} />
          </label>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="flex flex-col gap-5">

        <Field
          label="Nom complet"
          value={profile?.full_name || ""}
          onChange={(v: any) => setProfile({ ...profile, full_name: v })}
        />

        <Field
          label="Email"
          value={profile?.email || user?.email || ""}
          disabled
        />

        <Field
          label="Téléphone"
          value={profile?.phone || ""}
          onChange={(v: any) => setProfile({ ...profile, phone: v })}
        />

        <Field
          label="Adresse"
          value={profile?.address || ""}
          onChange={(v: any) => setProfile({ ...profile, address: v })}
        />

        <Field
          label="Date de naissance"
          type="date"
          value={profile?.birthdate || ""}
          onChange={(v: any) => setProfile({ ...profile, birthdate: v })}
        />
      </div>

      {/* BOUTON ENREGISTRER */}
      <button
        onClick={async () => {
          await supabase
            .from("profiles")
            .update({
              full_name: profile.full_name,
              phone: profile.phone,
              address: profile.address,
              birthdate: profile.birthdate,
            })
            .eq("id", user.id);

          alert("✔ Profil mis à jour !");
          router.push("/profil");
        }}
        className="mt-10 w-full py-3 rounded-full bg-[hsl(var(--primary))] text-white font-semibold"
      >
        Enregistrer
      </button>
    </div>
  );
}

/* ----------------------------
   COMPONENT FIELD
---------------------------- */
function Field({ label, value, onChange, type = "text", disabled = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-4 py-3 rounded-xl border border-slate-300
          bg-[hsl(var(--input))] outline-none
        "
      />
    </div>
  );
}
