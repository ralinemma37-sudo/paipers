"use client";

/**
 * En-tête sous-page Profil — retour + titre.
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
};

export default function ProfilSubpageHeader({
  title,
  subtitle,
  backHref = "/profil",
}: Props) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Link
        href={backHref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "#64748b",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        <ChevronLeft size={18} />
        Retour
      </Link>
      <h1 className="paipers-screen-title" style={{ marginBottom: 6 }}>
        {title}
      </h1>
      {subtitle ? (
        <p
          className="paipers-text-muted"
          style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
