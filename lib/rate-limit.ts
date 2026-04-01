/**
 * In-memory rate limiter.
 *
 * Tracks request counts per key (e.g. IP or user ID) within a sliding window.
 * Two tiers are defined:
 *   - standard  : loose limit for normal operations
 *   - strict    : tight limit for dangerous / high-risk operations
 *
 * This is intentionally simple.  A Redis-backed implementation can replace it
 * by swapping out the `check` function without changing call sites.
 */

interface BucketEntry {
  count: number
  windowStart: number
}

const buckets = new Map<string, BucketEntry>()

const TIERS = {
  standard: { windowMs: 60_000, max: 30 },
  strict: { windowMs: 60_000, max: 5 },
} as const

export type RateLimitTier = keyof typeof TIERS

export interface RateLimitResult {
  allowed: boolean
  /** Remaining requests in the current window. */
  remaining: number
  /** Milliseconds until the window resets. */
  resetInMs: number
}

/**
 * Check and record a request for `key` under `tier`.
 *
 * @param key   Unique identifier for the caller (IP address, user ID, etc.).
 * @param tier  'standard' (default) or 'strict' for dangerous operations.
 */
export function checkRateLimit(key: string, tier: RateLimitTier = 'standard'): RateLimitResult {
  const { windowMs, max } = TIERS[tier]
  const now = Date.now()
  const bucketKey = `${tier}:${key}`

  const existing = buckets.get(bucketKey)

  if (!existing || now - existing.windowStart >= windowMs) {
    // Start a fresh window.
    buckets.set(bucketKey, { count: 1, windowStart: now })
    return { allowed: true, remaining: max - 1, resetInMs: windowMs }
  }

  if (existing.count >= max) {
    const resetInMs = windowMs - (now - existing.windowStart)
    return { allowed: false, remaining: 0, resetInMs }
  }

  existing.count += 1
  return {
    allowed: true,
    remaining: max - existing.count,
    resetInMs: windowMs - (now - existing.windowStart),
  }
}
