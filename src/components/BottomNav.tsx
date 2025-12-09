// src/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, User } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/documents", label: "Docs", icon: FileText },
  { href: "/profil", label: "Profil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-md flex justify-around py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 text-xs"
            >
              <Icon
                className={
                  "h-5 w-5 " +
                  (active ? "text-black" : "text-slate-400")
                }
              />
              <span
                className={
                  active
                    ? "text-black font-medium"
                    : "text-slate-400"
                }
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
