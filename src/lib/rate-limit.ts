type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const MAX_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
        if (buckets.size < MAX_KEYS) break;
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfter: 0,
  };
}

export function getClientIp(request: Request, headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
