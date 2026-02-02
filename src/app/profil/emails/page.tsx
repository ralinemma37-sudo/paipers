"use client";

import { useState } from "react";
import Protected from "@/components/Protected";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function Logo({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="w-8 h-8 object-contain"
      />
    </div>
  );
}

function EmailCard({
  title,
  desc,
  logo,
  href,
  disabled = false,
  badge,
  onDisabledClick,
}: {
  title: string;
  desc: string;
  logo: React.ReactNode;
  href?: string;
  disabled?: boolean;
  badge?: string;
  onDisabledClick?: (title: string) => void;
}) {
  const content = (
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
  );

  if (disabled || !href) {
    return (
      <button
        type="button"
        onClick={() => onDisabledClick?.(title)}
        className="text-left active:scale-[0.99] transition"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className="block active:scale-[0.99] transition">
      {content}
    </Link>
  );
}

export default function EmailsPage() {
  const [toast, setToast] = useState("");

  function showSoon(name: string) {
    setToast(`${name} : pas encore disponible 🙂`);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <Protected>
      <main className="px-6 py-6 pb-24">
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
              Connexions <span className="gradient-text">emails</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Choisis ton service email pour importer tes documents.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-4">
          <EmailCard
            title="Gmail"
            desc="Disponible"
            logo={<Logo src="/email-logos/gmail.png" alt="Gmail" />}
            href="/profil/gmail"
          />

          <EmailCard
            title="Outlook"
            desc="Bientôt disponible"
            logo={<Logo src="/email-logos/outlook.png" alt="Outlook" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />

          <EmailCard
            title="Yahoo"
            desc="Bientôt disponible"
            logo={<Logo src="/email-logos/yahoo.png" alt="Yahoo Mail" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />

          <EmailCard
            title="iCloud"
            desc="Bientôt disponible"
            logo={<Logo src="/email-logos/icloud.png" alt="iCloud Mail" />}
            disabled
            badge="Bientôt"
            onDisabledClick={showSoon}
          />
        </section>

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
