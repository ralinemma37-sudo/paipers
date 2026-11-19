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
  /**
   * Lot « espace actif » : espace réellement confirmé (valeur mémorisée valide ou choix de la personne).
   * null tant que rien n'est confirmé : le Perso affiché par défaut ne vaut pas confirmation.
   */
  confirmedScope: "personal" | "pro" | "family" | null;
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
  const [confirmedScope, setConfirmedScope] = useState<"personal" | "pro" | "family" | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NAV_SCOPE_STORAGE_KEY);
      setSpaceState(scopeToNavSpace(raw));
      setConfirmedScope(raw === "personal" || raw === "pro" || raw === "family" ? raw : null);
    } catch {
      setSpaceState("personal");
      setConfirmedScope(null);
    }
    setLoaded(true);
  }, []);

  const setSpace = useCallback(
    (next: NavSpace) => {
      setSpaceState(next);
      setConfirmedScope(next);
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
      confirmedScope,
      spaceLabel: NAV_SPACE_LABELS[space],
      showProTabs: space === "pro",
      tabs: getVisibleTabs(space),
      tabActiveColor: getTabActiveColor(space),
      loaded,
      setSpace,
    }),
    [space, confirmedScope, loaded, setSpace],
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
