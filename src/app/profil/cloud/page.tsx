"use client";

import { useState } from "react";
import Protected from "@/components/Protected";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function Logo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
      <img src={src} alt={alt} className="w-8 h-8 object-contain" />
    </div>
  );
}

function CloudCard({
  title,
  desc,
  logo,
  disabled = false,
  badge,
  onDisabledClick,
}: {
  title: string;
  desc: string;
  logo: React.ReactNode;
  disabled?: boolean;
  badge?: string;
  onDisabledClick?: (title: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => (disabled ? onDisabledClick?.(title) : undefined)}
      className={`text-left active:scale-[0.99] transition ${
        disabled ? "" : "pointer-events-none"
      }`}
    >
      <div
        className={`card p-5 flex flex-col justify-between min-h-[150px] ${
          disabled ? "opacity-70" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          {logo}
          {badge ? (
            <span className="text-xs text-slate-400 border border-slate-200 px-2 py-1 rounded-full">
              {badge}
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="font-semibold">{title}</p>
          <p className="text-slate-500 text-sm mt-1">{desc}</p>
        </div>
      </div>
    </button>
  );
}

export default function CloudPage() {
  const [toast, setToast] = useState("");

  function showSoon(name: string) {
    setToast(`${name} : pas encore disponible 🙂`);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <Protected>
      <main className="px-6 py-6 pb-24">
        {/* Header */}
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
              Connexions <span className="gradient-text">cloud</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Sauvegarde et synchronisation (bientôt).
            </p>
          </div>
        </div>

        {/* Grille 2x2 */}
        <section className="grid grid-cols-2 gap-4">
          <CloudCard
            title="Google Drive"
            desc="Bientôt disponible"
            logo={<Logo src="/cloud-logos/drive.png" alt="Google Drive" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />

          <CloudCard
            title="Dropbox"
            desc="Bientôt disponible"
            logo={<Logo src="/cloud-logos/dropbox.png" alt="Dropbox" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />

          <CloudCard
            title="OneDrive"
            desc="Bientôt disponible"
            logo={<Logo src="/cloud-logos/onedrive.png" alt="OneDrive" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />

          <CloudCard
            title="iCloud Drive"
            desc="Bientôt disponible"
            logo={<Logo src="/cloud-logos/icloud-drive.png" alt="iCloud Drive" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />
        </section>

        {/* Toast */}
        {toast && (
          <div className="fixed left-0 right-0 bottom-20 flex justify-center px-6 z-50">
            <div className="card px-4 py-3 text-sm text-slate-700 shadow-md">
              {toast}
            </div>
          </div>
        )}
      </main>
    </Protected>
  );
}
