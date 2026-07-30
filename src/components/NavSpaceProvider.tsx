"use client";

/**
 * État d’espace pour la navigation web (Personnel / Professionnel).
 * Persistance : localStorage clé paipers-account-scope (déjà utilisée web).
 *
 * Ne synchronise pas encore les workspaces Supabase — navigation UI uniquement.
 * Réf. mobile : AccountProfileProvider appMode + WorkspaceProvider showProTabs.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseAccountScope } from "@/lib/accountScope";
import {
  NAV_SCOPE_STORAGE_KEY,
  NAV_SPACE_LABELS,
  getTabActiveColor,
  getVisibleTabs,
  routeAfterSpaceSwitch,
  type NavSpace,
  type NavTab,
} from "@/lib/navConfig";

type NavSpaceContextValue = {
  space: NavSpace;
  spaceLabel: string;
  showProTabs: boolean;
  tabs: NavTab[];
  tabActiveColor: string;
  loaded: boolean;
  setSpace: (next: NavSpace) => void;
};

const NavSpaceContext = createContext<NavSpaceContextValue | null>(null);

function scopeToNavSpace(raw: string | null): NavSpace {
  const parsed = parseAccountScope(raw);
  // family → personal pour la barre (mobile filtre la famille du switcher owned)
  return parsed === "pro" ? "pro" : "personal";
}

export function NavSpaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [space, setSpaceState] = useState<NavSpace>("personal");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setSpaceState(scopeToNavSpace(localStorage.getItem(NAV_SCOPE_STORAGE_KEY)));
    } catch {
      setSpaceState("personal");
    }
    setLoaded(true);
  }, []);

  const setSpace = useCallback(
    (next: NavSpace) => {
      setSpaceState(next);
      try {
        localStorage.setItem(NAV_SCOPE_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      const redirect = routeAfterSpaceSwitch(pathname, next);
      if (redirect) {
        router.replace(redirect);
      }
    },
    [pathname, router],
  );

  const value = useMemo<NavSpaceContextValue>(
    () => ({
      space,
      spaceLabel: NAV_SPACE_LABELS[space],
      showProTabs: space === "pro",
      tabs: getVisibleTabs(space),
      tabActiveColor: getTabActiveColor(space),
      loaded,
      setSpace,
    }),
    [space, loaded, setSpace],
  );

  return (
    <NavSpaceContext.Provider value={value}>{children}</NavSpaceContext.Provider>
  );
}

export function useNavSpace(): NavSpaceContextValue {
  const ctx = useContext(NavSpaceContext);
  if (!ctx) {
    throw new Error("useNavSpace must be used within NavSpaceProvider");
  }
  return ctx;
}
