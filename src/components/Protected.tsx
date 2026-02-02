"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace(`/auth?next=${encodeURIComponent(pathname || "/dashboard")}`);
        return;
      }

      if (mounted) setReady(true);
    };

    run();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace(`/auth?next=${encodeURIComponent(pathname || "/dashboard")}`);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
        Chargement…
      </div>
    );
  }

  return <>{children}</>;
}
