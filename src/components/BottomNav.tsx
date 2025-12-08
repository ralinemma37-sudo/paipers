"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, PenLine, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const allowed = ["/dashboard", "/documents", "/generer", "/profil"];
  const show = allowed.some((p) => pathname.startsWith(p));

  if (!show) return null;

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/90 dark:bg-[hsl(var(--muted))] backdrop-blur-xl border border-[hsl(var(--border))] rounded-3xl shadow-lg px-6 py-2 flex justify-around items-center z-50"
    >
      <NavItem href="/dashboard" icon={<Home size={22} />} label="Accueil" active={pathname === "/dashboard"} />
      <NavItem href="/documents" icon={<FileText size={22} />} label="Documents" active={pathname.startsWith("/documents")} />
      <NavItem href="/generer" icon={<PenLine size={22} />} label="Générer" active={pathname === "/generer"} />
      <NavItem href="/profil" icon={<User size={22} />} label="Profil" active={pathname.startsWith("/profil")} />
    </nav>
  );
}

function NavItem({ href, icon, label, active }: any) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1">
      <div
        className={
          active
            ? "flex flex-col items-center justify-center transition-all duration-200 text-[hsl(var(--primary))] scale-110"
            : "flex flex-col items-center justify-center transition-all duration-200 text-muted"
        }
      >
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
    </Link>
  );
}
