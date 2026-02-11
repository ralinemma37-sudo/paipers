"use client";

import { useEffect, useMemo } from "react";

export default function GmailOpenPage({
  searchParams,
}: {
  searchParams: { to?: string };
}) {
  const to = useMemo(() => {
    try {
      return searchParams.to ? decodeURIComponent(searchParams.to) : "";
    } catch {
      return "";
    }
  }, [searchParams.to]);

  useEffect(() => {
    if (!to) return;
    // tentative auto
    window.location.href = to;
  }, [to]);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
        Ouvrir Paipers
      </h1>
      <p style={{ opacity: 0.75, marginBottom: 16 }}>
        Clique si l’ouverture ne se fait pas automatiquement.
      </p>

      <a
        href={to}
        style={{
          display: "inline-block",
          padding: "12px 16px",
          borderRadius: 12,
          background: "black",
          color: "white",
          textDecoration: "none",
          fontWeight: 800,
        }}
      >
        Ouvrir l’app
      </a>
    </main>
  );
}
