import { Suspense } from "react";
import DocumentViewClient from "./DocumentViewClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Chargement...</div>}>
      <DocumentViewClient />
    </Suspense>
  );
}
