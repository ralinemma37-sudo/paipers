import Link from "next/link";
import { PAIPERS_COLORS, PAIPERS_PALETTES, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Section = { title: string; paragraphs: string[] };

/**
 * Page légale du site (CGU/CGV, confidentialité, mentions légales) — 05/11/2026.
 * Mêmes textes que l'appli (src/legal/*, copiés de paipers-mobile) ; plus aucune note interne affichée.
 */
export function LegalDocumentPage(props: {
  title: string;
  lastUpdated: string;
  sections: Section[];
  footer: string;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: PAIPERS_PALETTES.light.background, padding: PAIPERS_SPACE.screenPad, paddingBottom: 48 }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ fontWeight: 700, color: PAIPERS_PALETTES.light.textMuted, textDecoration: "none" }}>
          ← Retour
        </Link>
        <h1 className="paipers-screen-title" style={{ marginTop: 16, marginBottom: 8 }}>
          {props.title}
        </h1>
        <p className="paipers-text-muted" style={{ marginBottom: 24 }}>
          Dernière mise à jour : {props.lastUpdated}
        </p>
        {props.sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: PAIPERS_COLORS.navy, marginBottom: 8 }}>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p
                key={p.slice(0, 48)}
                style={{ fontSize: 14, lineHeight: "22px", color: PAIPERS_COLORS.textPrimary, marginBottom: 10, overflowWrap: "anywhere" }}
              >
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="paipers-text-muted" style={{ fontSize: 13, marginTop: 16 }}>
          {props.footer}
        </p>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 24, fontSize: 13 }}>
          <Link href="/legal/cgu">Conditions générales</Link>
          <Link href="/legal/politique-confidentialite">Confidentialité</Link>
          <Link href="/legal/mentions-legales">Mentions légales</Link>
        </nav>
      </div>
    </div>
  );
}
