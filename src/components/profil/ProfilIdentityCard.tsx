"use client";

/**
 * Carte identité — contraste desktop premium.
 */

import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

type Props = {
  name: string;
  email: string;
  badge: string;
  href: string;
};

export default function ProfilIdentityCard({ name, email, badge, href }: Props) {
  return (
    <Link
      href={href}
      className="paipers-card-night paipers-hover-lift block"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "20px 20px",
        textDecoration: "none",
        color: "inherit",
        marginBottom: 20,
        background: `radial-gradient(ellipse 60% 80% at 100% 0%, rgba(172,228,255,0.18), transparent 50%),
          linear-gradient(135deg, ${DESKTOP_SURFACES.night} 0%, ${DESKTOP_SURFACES.marine} 100%)`,
      }}
    >
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          background: "rgba(255,255,255,0.12)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        <User size={28} color={DESKTOP_SURFACES.onDark} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(172,228,255,0.2)",
            color: DESKTOP_SURFACES.accentLine,
          }}
        >
          {badge}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 20,
            fontWeight: 800,
            color: DESKTOP_SURFACES.onDark,
            marginTop: 8,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 14,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: DESKTOP_SURFACES.onDarkMuted,
          }}
        >
          {email || "—"}
        </span>
      </span>
      <ChevronRight size={20} color={DESKTOP_SURFACES.onDarkSoft} />
    </Link>
  );
}
