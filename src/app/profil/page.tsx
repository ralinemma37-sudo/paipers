"use client";

import Protected from "@/components/Protected";
import Link from "next/link";
import { ChevronRight, User, Mail, Cloud, Settings, CreditCard } from "lucide-react";

const items = [
  {
    href: "/profil/informations",
    title: "Informations",
    desc: "Tes infos personnelles et préférences.",
    icon: <User className="text-[hsl(var(--primary))]" />,
  },
  {
    href: "/profil/emails",
    title: "Emails",
    desc: "Connexions email et import automatique.",
    icon: <Mail className="text-[hsl(var(--primary))]" />,
  },
  {
    href: "/profil/cloud",
    title: "Cloud",
    desc: "Stockage et synchronisation.",
    icon: <Cloud className="text-[hsl(var(--primary))]" />,
  },
  {
    href: "/profil/parametres",
    title: "Paramètres",
    desc: "Réglages de l’application.",
    icon: <Settings className="text-[hsl(var(--primary))]" />,
  },
  {
    href: "/profil/abonnement",
    title: "Abonnement",
    desc: "Plan, facturation et options.",
    icon: <CreditCard className="text-[hsl(var(--primary))]" />,
  },
];

export default function ProfilHomePage() {
  return (
    <Protected>
      <div className="px-6 py-8 pb-24">
        <h1 className="text-3xl font-bold mb-1 text-[hsl(var(--foreground))]">
          Mon <span className="gradient-text">profil</span>
        </h1>

        <p className="text-[hsl(var(--foreground)/0.6)] mb-6">
          Accède rapidement à tes informations, tes réglages et tes connexions email.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-4">
            Réglages & compte
          </h2>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card flex items-center justify-between py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))]">
                      {item.title}
                    </p>
                    <p className="text-[hsl(var(--foreground)/0.6)] text-sm">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="text-[hsl(var(--foreground)/0.4)]" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Protected>
  );
}
