"use client";

/**
 * Hub Générer — réf. paipers-mobile/src/features/generer/GenererHubContent.tsx
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileEdit, PenLine, Sparkles } from "lucide-react";
import GenererActionCard from "@/components/generer/GenererActionCard";
import {
  fetchGenererRecents,
  formatRelativeFr,
  type GenererRecentDoc,
  type GenererRecentKind,
} from "@/lib/genererRecents";
import { supabase } from "@/lib/supabase";
import {
  PAIPERS_COLORS,
  PAIPERS_FOLDER_CIRCLE_BACKGROUNDS,
  PAIPERS_FOLDER_ICON_COLORS,
} from "@/lib/paipersTheme";

const BADGES = {
  Rédigé: {
    pastel: PAIPERS_FOLDER_CIRCLE_BACKGROUNDS["#ACE4FF"],
    vivid: PAIPERS_FOLDER_ICON_COLORS["#ACE4FF"],
  },
  Complété: {
    pastel: PAIPERS_FOLDER_CIRCLE_BACKGROUNDS["#F7C4E8"],
    vivid: PAIPERS_FOLDER_ICON_COLORS["#F7C4E8"],
  },
  Signé: {
    pastel: PAIPERS_FOLDER_CIRCLE_BACKGROUNDS["#FFECC9"],
    vivid: PAIPERS_FOLDER_ICON_COLORS["#FFECC9"],
  },
} as const satisfies Record<
  GenererRecentKind,
  { pastel: string; vivid: string }
>;

type Props = {
  /** Segment Factures Pro — réf. GenererHubContent embedded */
  embedded?: boolean;
};

export default function GenererHub({ embedded = false }: Props) {
  const [recents, setRecents] = useState<GenererRecentDoc[]>([]);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setRecents([]);
      return;
    }
    setRecents(await fetchGenererRecents(auth.user.id));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      {!embedded ? (
        <>
          <h1 className="paipers-screen-title" style={{ marginBottom: 0 }}>
            Générer
          </h1>
          <p
            className="paipers-text-muted"
            style={{ marginTop: 10, fontSize: 15, lineHeight: "22px", marginBottom: 0 }}
          >
            Créez, modifiez et signez vos documents en quelques secondes.
          </p>
        </>
      ) : (
        <p
          className="paipers-text-muted"
          style={{ marginTop: 0, fontSize: 15, lineHeight: "22px", marginBottom: 0 }}
        >
          Créez, modifiez et signez vos documents en quelques secondes.
        </p>
      )}

      <div className="mt-[22px] flex flex-col gap-3.5 md:grid md:grid-cols-3 md:gap-4">
        <GenererActionCard
          href="/generer/rediger-document"
          title="Rédiger un document"
          desc="Laissez Paipers rédiger vos documents grâce à l'IA. Courriers, contrats, dossiers complets."
          Icon={Sparkles}
          badgePastel={BADGES.Rédigé.pastel}
          vivid={BADGES.Rédigé.vivid}
        />
        <GenererActionCard
          href="/generer/remplir-document"
          title="Compléter un document"
          desc="Remplissez automatiquement vos PDF existants. Formulaires, attestations, déclarations."
          Icon={FileEdit}
          badgePastel={BADGES.Complété.pastel}
          vivid={BADGES.Complété.vivid}
        />
        <GenererActionCard
          href="/generer/select-document"
          title="Signer un document"
          desc="Ajoutez votre signature sur n'importe quel PDF. Simple, rapide et légal."
          Icon={PenLine}
          badgePastel={BADGES.Signé.pastel}
          vivid={BADGES.Signé.vivid}
        />
      </div>

      <h2
        style={{
          marginTop: 28,
          fontSize: 18,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
          marginBottom: 0,
        }}
      >
        Récents
      </h2>

      {recents.length === 0 ? (
        <p
          className="paipers-text-muted"
          style={{ marginTop: 12, fontSize: 14, lineHeight: "20px", marginBottom: 0 }}
        >
          Tes documents rédigés, complétés ou signés apparaîtront ici.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-0 md:grid md:grid-cols-2 md:gap-3">
          {recents.map((doc, index) => {
            const badge = BADGES[doc.kind];
            const when = formatRelativeFr(doc.created_at);
            return (
              <Link
                key={doc.id}
                href={`/documents/view?id=${doc.id}`}
                className="paipers-elevated-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  textDecoration: "none",
                  color: "inherit",
                  borderTop:
                    index === 0
                      ? undefined
                      : undefined,
                }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontWeight: 700,
                      fontSize: 15,
                      color: PAIPERS_COLORS.textPrimary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doc.title}
                  </span>
                  <span
                    style={{
                      marginTop: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: badge.pastel,
                        color: badge.vivid,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {doc.kind}
                    </span>
                    {when ? (
                      <span
                        className="paipers-text-muted"
                        style={{ fontSize: 12, fontWeight: 600 }}
                      >
                        {when}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
