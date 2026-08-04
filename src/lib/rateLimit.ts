/**
 * Rate limiting waitlist — abstraction serverless.
 *
 * ## Comportement actuel (MemoryRateLimiter)
 * - Compteurs en mémoire du process Node.
 * - Sur Vercel : chaque instance a sa propre mémoire → la limite est **approximative**
 *   (un attaquant peut légèrement dépasser le plafond en multi-instance).
 * - Suffisant comme filet anti-abus basique, **pas** une protection DDoS distribuée.
 *
 * ## Production recommandée
 * Brancher un store distribué (ex. Upstash Redis / Vercel KV) via la même interface
 * `RateLimitStore` sans changer les routes. Ne pas ajouter de service payant ici
 * sans validation produit.
 *
 * ## Clés
 * - join : email (principal) + IP (plafond plus haut pour ne pas bloquer un NAT)
 * - confirm : IP + préfixe de token (évite le brute-force de tokens)
 */

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export type RateLimitStore = {
  hit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
};

type Bucket = { count: number; resetAt: number };

class MemoryRateLimiter implements RateLimitStore {
  private buckets = new Map<string, Bucket>();

  async hit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { ok: true, remaining: Math.max(0, limit - 1), resetAt };
    }
    existing.count += 1;
    const ok = existing.count <= limit;
    return {
      ok,
      remaining: Math.max(0, limit - existing.count),
      resetAt: existing.resetAt,
    };
  }
}

/** Singleton process-local — voir limites ci-dessus. */
const store: RateLimitStore = new MemoryRateLimiter();

export function getRateLimitStore(): RateLimitStore {
  return store;
}

export const WAITLIST_RATE_LIMITS = {
  /** Inscriptions par adresse e-mail (fenêtre 15 min). */
  joinPerEmail: { limit: 5, windowMs: 15 * 60 * 1000 },
  /** Inscriptions par IP (plafond large pour NAT/école/entreprise). */
  joinPerIp: { limit: 40, windowMs: 15 * 60 * 1000 },
  /** Confirmations par IP. */
  confirmPerIp: { limit: 30, windowMs: 15 * 60 * 1000 },
  /** Tentatives par préfixe de token (anti-bruteforce). */
  confirmPerTokenPrefix: { limit: 10, windowMs: 15 * 60 * 1000 },
} as const;

export function clientIpFromRequest(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export function rateLimitExceededResponse(): Response {
  return Response.json(
    {
      ok: false,
      error: "Trop de tentatives. Réessaie dans quelques minutes.",
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": "300",
      },
    },
  );
}
