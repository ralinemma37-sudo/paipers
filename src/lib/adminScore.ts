/**
 * Score administratif MVP — réf. paipers-mobile/src/lib/adminScore.ts
 */

export function computeAdminScore(input: {
  reviewCount: number;
  unfiledCount: number;
  expiringWithin30Days: number;
  openAlertsCount?: number;
  profileBonus?: number;
}): number {
  let s = 100;
  s -= Math.min(35, input.reviewCount * 12);
  s -= Math.min(25, input.unfiledCount * 5);
  s -= Math.min(20, input.expiringWithin30Days * 6);
  s -= Math.min(15, (input.openAlertsCount ?? 0) * 3);
  const bonus = Math.min(25, Math.max(0, input.profileBonus ?? 0));
  return Math.max(0, Math.min(100, Math.round(s + bonus)));
}
