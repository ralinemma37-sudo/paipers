"use client";

import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { Sparkles } from "lucide-react";

export default function AssistantPage() {
  return (
    <Protected>
      <AppShell>
        <div className="px-6 py-8 pb-24 md:pb-8">
          <h1 className="text-3xl font-bold mb-1">
            <span className="gradient-text">Assistant</span>
          </h1>
          <p className="text-slate-500 mb-6">
            Pose tes questions et laisse Paipers t’aider.
          </p>

          <div className="card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary))]/25 flex items-center justify-center shrink-0">
              <Sparkles className="text-[hsl(202_80%_55%)]" size={24} />
            </div>
            <div>
              <p className="font-medium text-slate-800">
                Ton assistant Paipers arrive ici.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Cette section sera bientôt disponible.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
