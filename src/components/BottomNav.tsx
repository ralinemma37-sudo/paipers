"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Wand2, User } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/generer", label: "Générer", icon: Wand2 },
  { href: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-3 py-1 active:scale-95 transition"
            >
              <Icon
                size={20}
                className={active ? "text-slate-700" : "text-slate-300"}
              />
              <span
                className={`text-[11px] ${
                  active ? "text-slate-700 font-medium" : "text-slate-300"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
