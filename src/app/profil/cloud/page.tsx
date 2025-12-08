"use client";

import Link from "next/link";

export default function CloudServicesPage() {
  const clouds = [
    { name: "Google Drive", logo: "/logos/drive.png", href: "#" },
    { name: "Dropbox", logo: "/logos/dropbox.png", href: "#" },
    { name: "OneDrive", logo: "/logos/onedrive.png", href: "#" },
    { name: "iCloud Drive", logo: "/logos/icloud.png", href: "#" },
  ];

  return (
    <div className="px-6 pt-10 pb-24">

      {/* RETOUR */}
      <Link href="/profil" className="text-[hsl(var(--primary))] block mb-6">
        ← Retour
      </Link>

      <h1 className="text-3xl font-bold mb-2">Services Cloud</h1>
      <p className="text-[hsl(var(--foreground)/0.6)] mb-8">
        Connectez vos services cloud pour synchroniser vos documents automatiquement ☁️
      </p>

      {/* LISTE DES SERVICES */}
      <div className="grid grid-cols-2 gap-5 mt-4">
        {clouds.map((c) => (
          <div
            key={c.name}
            className="card flex flex-col items-center justify-center gap-3 py-6 text-center"
          >
            <img src={c.logo} alt={c.name} className="w-12 h-12" />
            {/* FORCE LE TEXTE EN FONCTION DU MODE */}
            <span className="font-medium text-[hsl(var(--foreground))]">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
