"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Sparkles,
  Wand2,
  User,
  Settings,
  Briefcase,
  UserRound,
} from "lucide-react";
import { parseAccountScope, type AccountScope } from "@/lib/accountScope";

const SCOPE_STORAGE_KEY = "paipers-account-scope";

const mainNav = [
  { href: "/dashboard", label: "Accueil", icon: Home },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/generer", label: "Générer", icon: Wand2 },
];

const secondaryNav = [
  { href: "/profil", label: "Profil", icon: User },
  { href: "/profil/parametres", label: "Paramètres", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/profil") {
    return pathname === "/profil" || pathname.startsWith("/profil/");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [scope, setScope] = useState<AccountScope>("personal");

  useEffect(() => {
    try {
      setScope(parseAccountScope(localStorage.getItem(SCOPE_STORAGE_KEY)));
    } catch {
      setScope("personal");
    }
  }, []);

  function selectScope(next: AccountScope) {
    setScope(next);
    try {
      localStorage.setItem(SCOPE_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col h-screen sticky top-0 p-4">
      <div className="flex flex-col h-full rounded-[1.75rem] bg-white/90 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm overflow-hidden">
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <img
              src="/logo-paipers.png"
              alt="Logo Paipers"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold tracking-tight text-slate-800">
              Paipers
            </span>
          </Link>
        </div>

        {/* Navigation principale */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] transition-all",
                  active
                    ? "bg-gradient-to-r from-[hsl(202_100%_95%)] via-[hsl(328_80%_96%)] to-[hsl(39_100%_96%)] text-slate-900 font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                ].join(" ")}
              >
                <Icon
                  size={20}
                  className={
                    active ? "text-[hsl(202_80%_55%)]" : "text-slate-400"
                  }
                />
                {item.label}
              </Link>
            );
          })}

          {/* Séparation */}
          <div className="my-4 mx-2 border-t border-slate-100" />

          {/* Personnel / Professionnel */}
          <div className="px-1 mb-3">
            <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Espace
            </p>
            <div className="flex gap-1.5 p-1 rounded-2xl bg-[hsl(0_0%_97%)] border border-slate-100">
              <button
                type="button"
                onClick={() => selectScope("personal")}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all",
                  scope === "personal"
                    ? "bg-white text-slate-800 font-semibold shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                <UserRound size={16} />
                Personnel
              </button>
              <button
                type="button"
                onClick={() => selectScope("pro")}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all",
                  scope === "pro"
                    ? "bg-white text-slate-800 font-semibold shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                <Briefcase size={16} />
                Pro
              </button>
            </div>
          </div>

          {secondaryNav.map((item) => {
            const Icon = item.icon;
            // Profil : actif sur /profil et sous-pages, sauf Paramètres
            // Paramètres : actif uniquement sur /profil/parametres
            const isItemActive =
              item.href === "/profil"
                ? pathname === "/profil" ||
                  (pathname.startsWith("/profil/") &&
                    !pathname.startsWith("/profil/parametres"))
                : pathname.startsWith("/profil/parametres");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] transition-all",
                  isItemActive
                    ? "bg-gradient-to-r from-[hsl(202_100%_95%)] via-[hsl(328_80%_96%)] to-[hsl(39_100%_96%)] text-slate-900 font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                ].join(" ")}
              >
                <Icon
                  size={20}
                  className={
                    isItemActive
                      ? "text-[hsl(202_80%_55%)]"
                      : "text-slate-400"
                  }
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-[hsl(202_100%_95%)] via-[hsl(328_80%_96%)] to-[hsl(39_100%_96%)] p-4">
            <p className="text-sm font-semibold text-slate-800">Paipers</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Ton coffre-fort administratif
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
