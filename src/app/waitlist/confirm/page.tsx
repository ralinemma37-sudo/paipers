import { Suspense } from "react";
import type { Metadata } from "next";
import WaitlistConfirmClient from "./WaitlistConfirmClient";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

export const metadata: Metadata = {
  title: "Confirmation liste d’attente — Paipers",
  description: "Confirme ton inscription à la liste d’attente Paipers.",
};

function ConfirmFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: DESKTOP_SURFACES.night,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        color: DESKTOP_SURFACES.onDarkMuted,
        fontSize: 15,
      }}
    >
      Confirmation…
    </div>
  );
}

export default function WaitlistConfirmPage() {
  return (
    <Suspense fallback={<ConfirmFallback />}>
      <WaitlistConfirmClient />
    </Suspense>
  );
}
