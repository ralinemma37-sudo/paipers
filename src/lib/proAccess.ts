/**
 * Accès Pro réel (abonnement) vs aperçu UI (space switcher localStorage).
 * Ne modifie pas le checkout — lecture seule profiles.
 * Réf. mobile : AccountProfileProvider isProMode (plan pro + trial + appMode).
 */

import { supabase } from "@/lib/supabase";

export type ProSubscriptionStatus = "free" | "premium" | "pro" | "unknown";

export type ProAccessSnapshot = {
  subscriptionPlan: ProSubscriptionStatus;
  /** Plan Pro réellement enregistré en base (pas le switcher UI). */
  hasProSubscription: boolean;
  /** Signup a demandé Pro mais checkout web absent. */
  activationPending: boolean;
};

export async function loadProAccessSnapshot(): Promise<ProAccessSnapshot> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return {
      subscriptionPlan: "unknown",
      hasProSubscription: false,
      activationPending: false,
    };
  }

  const meta = (auth.user.user_metadata || {}) as {
    pro_activation_pending?: boolean;
    subscription_plan?: string;
  };

  const { data } = await supabase
    .from("profiles")
    .select("subscription_plan,account_type")
    .eq("id", auth.user.id)
    .maybeSingle();

  const raw = String(data?.subscription_plan || data?.account_type || "free").toLowerCase();
  const subscriptionPlan: ProSubscriptionStatus =
    raw === "pro" ? "pro" : raw === "premium" ? "premium" : "free";

  return {
    subscriptionPlan,
    hasProSubscription: subscriptionPlan === "pro",
    activationPending: Boolean(meta.pro_activation_pending) && subscriptionPlan !== "pro",
  };
}
