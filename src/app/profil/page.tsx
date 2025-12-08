"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  User,
  Mail,
  Cloud,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const u = userData?.user;
      setUser(u);

      if (!u) {
        setLoading(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      setProfile(existingProfile);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading)
    return <div className="p-6 text-muted">Chargement...</div>;

  if (!user)
    return <div className="p-6 text-main">Veuillez vous connecter.</div>;

  return (
    <div className="px-6 pt-14 pb-24 space-y-8">

      {/* TITRE */}
      <div>
        <h1 className="text-3xl font-bold text-main">Profil</h1>
        <p className="text-muted">Gérez votre compte et vos préférences</p>
      </div>

      {/* CARTE PROFIL */}
      <div className="card flex items-center gap-4">
        <img
          src={profile?.avatar_url || "/placeholder-avatar.png"}
          className="w-16 h-16 rounded-full object-cover border border-[hsl(var(--border))]"
        />
        <div>
          <p className="text-lg font-semibold text-main">
            {profile?.full_name || "Nom non renseigné"}
          </p>
          <p className="text-muted text-sm">{user.email}</p>
        </div>
      </div>

      {/* SECTION COMPTE */}
      <SectionTitle>Compte</SectionTitle>

      <ProfileLink
        href="/profil/informations"
        icon={<User className="text-[hsl(var(--primary))]" />}
        label="Informations personnelles"
      />

      <ProfileLink
        href="/profil/abonnement"
        icon={<CreditCard className="text-[hsl(var(--primary))]" />}
        label="Abonnement"
        rightBadge="Gratuit"
      />

      {/* SECTION SOURCES */}
      <SectionTitle>Sources connectées</SectionTitle>

      <ProfileLink
        href="/profil/emails"
        icon={<Mail className="text-[hsl(var(--primary))]" />}
        label="Emails"
        rightText="0 connectés"
      />

      <ProfileLink
        href="/profil/cloud"
        icon={<Cloud className="text-[hsl(var(--primary))]" />}
        label="Services cloud"
        rightText="0 connectés"
      />

      {/* SECTION PARAMÈTRES */}
      <SectionTitle>Paramètres</SectionTitle>

      <ProfileLink
        href="/profil/parametres"
        icon={<Settings className="text-[hsl(var(--primary))]" />}
        label="Paramètres généraux"
      />

      {/* Déconnexion */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
        className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-500 py-3 rounded-full font-medium"
      >
        <LogOut size={18} /> Déconnexion
      </button>
    </div>
  );
}

function SectionTitle({ children }: any) {
  return (
    <h2 className="text-sm font-semibold text-muted mt-4 mb-2 uppercase tracking-wide">
      {children}
    </h2>
  );
}

function ProfileLink({ href, icon, label, rightText, rightBadge }: any) {
  return (
    <Link href={href} className="card flex items-center justify-between py-4 px-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-main">{label}</span>
      </div>

      {rightBadge && (
        <span className="text-xs font-medium bg-[hsl(var(--muted))] px-3 py-1 rounded-full text-main">
          {rightBadge}
        </span>
      )}

      {rightText && (
        <span className="text-sm text-muted">{rightText} ›</span>
      )}

      {!rightText && !rightBadge && (
        <span className="text-muted text-lg">›</span>
      )}
    </Link>
  );
}
