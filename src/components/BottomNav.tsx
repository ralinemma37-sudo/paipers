"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/documents", label: "Documents" },
  { href: "/generer", label: "Générer" },
  { href: "/profil", label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                "flex h-12 flex-1 items-center justify-center rounded-xl text-sm",
                active ? "font-semibold text-black" : "text-gray-500",
              ].join(" ")}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

