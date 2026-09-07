/**
 * Best-effort in-memory rate limiter.
 *
 * Serverless instances are per-region and recycled, so this is a guard against
 * a single client hammering a route, not a global quota — a determined attacker
 * spread across instances can exceed the limit. Swap in a shared store (Redis /
 * Upstash) if that ever matters.
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Keep the map from growing without bound on long-lived instances.
const MAX_KEYS = 10_000;

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the current window resets — use for `Retry-After`. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_KEYS) {
      for (const [k, w] of windows) {
        if (w.resetAt <= now) windows.delete(k);
      }
      if (windows.size >= MAX_KEYS) windows.clear();
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  return { ok: true, retryAfter: 0 };
}

/** 429 body + `Retry-After` header for a rejected request. */
export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}
