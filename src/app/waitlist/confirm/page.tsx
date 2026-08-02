import { Suspense } from "react";
import type { Metadata } from "next";
import WaitlistConfirmClient from "./WaitlistConfirmClient";

export const metadata: Metadata = {
  title: "Confirmation liste d’attente — Paipers",
  description: "Confirme ton inscription à la liste d’attente Paipers.",
};

export default function WaitlistConfirmPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: "center" }}>Confirmation…</div>
      }
    >
      <WaitlistConfirmClient />
    </Suspense>
  );
}
