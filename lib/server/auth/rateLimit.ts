// lib/server/auth/rateLimit.ts
//
// KNOWN LIMITATION, stated plainly rather than overclaimed: this is an
// in-memory limiter. On Vercel's serverless runtime, each function
// instance has its OWN memory, so this does NOT provide a single,
// shared, distributed rate limit across concurrent invocations — a
// determined attacker spreading requests across cold starts could
// exceed the intended limit. It DOES meaningfully slow down the common
// case (repeated requests hitting a warm instance) and is a reasonable
// Stage 1 foundation. A production-grade fix (Upstash Redis or Vercel
// KV-backed limiter) is a near-term follow-up, not implemented here to
// avoid adding an external service dependency not yet approved.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function clientKey(request: Request, suffix: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${ip}:${suffix}`;
}
