"use client";

import Link from "next/link";

export default function EmailsPage() {
  const services = [
    { name: "Gmail", logo: "/logos/gmail.png", href: "/profil/gmail" },
    { name: "Outlook", logo: "/logos/outlook.png", href: "#" },
    { name: "Yahoo Mail", logo: "/logos/yahoo.png", href: "#" },
    { name: "iCloud Mail", logo: "/logos/icloud.png", href: "#" },
  ];

  return (
    <div className="px-6 pt-10 pb-24">

      {/* RETOUR */}
      <Link href="/profil" className="text-[hsl(var(--primary))] block mb-6">
        ← Retour
      </Link>

      <h1 className="text-3xl font-bold mb-2">Emails</h1>
      <p className="text-[hsl(var(--foreground)/0.6)] mb-8">
        Connectez vos comptes email pour l’import automatique de documents ✨
      </p>

      {/* LISTE DES SERVICES */}
      <div className="grid grid-cols-2 gap-5 mt-4">
        {services.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            className="card flex flex-col items-center justify-center gap-3 py-6 hover:scale-[1.03] transition text-center"
          >
            <img src={s.logo} alt={s.name} className="w-12 h-12" />
            <span className="font-medium text-[hsl(var(--foreground))]">{s.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
