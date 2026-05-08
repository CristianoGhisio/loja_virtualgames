/**
 * In-memory rate limiter for API routes.
 *
 * Uses a sliding window approach stored in a Map. Suitable for single-instance
 * deployments. For multi-instance deployments, replace with a Redis-backed
 * implementation (e.g. @upstash/ratelimit).
 *
 * Falls back to database persistence via Prisma to survive server restarts.
 */

import { prisma } from '@/lib/prisma';

void initializeRateLimiter();

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;
const DB_SYNC_INTERVAL_MS = 30_000;

let lastCleanup = Date.now();
let lastDbSync = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

async function syncToDatabase(windowMs: number) {
  const now = Date.now();
  if (now - lastDbSync < DB_SYNC_INTERVAL_MS) return;
  lastDbSync = now;

  try {
    const cutoff = now - windowMs;
    for (const [key, entry] of store.entries()) {
      const activeTimestamps = entry.timestamps.filter((t) => t > cutoff);
      if (activeTimestamps.length === 0) {
        await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "key" = ${key}`;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "RateLimit" ("key", "timestamps", "updatedAt")
          VALUES (${key}, ${JSON.stringify(activeTimestamps)}, NOW())
          ON CONFLICT ("key") DO UPDATE SET
            "timestamps" = ${JSON.stringify(activeTimestamps)},
            "updatedAt" = NOW()
        `;
      }
    }
  } catch {
    // Database unavailable — silently fall back to in-memory only
  }
}

async function loadFromDatabase() {
  try {
    const rows = await prisma.$queryRaw<Array<{ key: string; timestamps: string }>>`
      SELECT "key", "timestamps" FROM "RateLimit"
    `;
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.timestamps);
        if (Array.isArray(parsed)) {
          store.set(row.key, { timestamps: parsed });
        }
      } catch {
        // Skip malformed entries
      }
    }
  } catch {
    // Table may not exist yet
  }
}

export type RateLimitConfig = {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Check whether a request identified by `key` is within the rate limit.
 *
 * Uses in-memory Map as primary store with database persistence as fallback.
 *
 * @param key   Unique identifier for the client (e.g. IP address).
 * @param config  Rate limit configuration.
 * @returns Whether the request is allowed and metadata.
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs } = config;
  const now = Date.now();
  const cutoff = now - windowMs;

  cleanup(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  entry.timestamps.push(now);

  syncToDatabase(windowMs);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Load rate limit entries from the database to restore state after restart.
 */
export async function initializeRateLimiter(): Promise<void> {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "RateLimit" (
        "key" TEXT PRIMARY KEY,
        "timestamps" TEXT NOT NULL DEFAULT '[]',
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    await loadFromDatabase();
  } catch {
    // Database unavailable — in-memory only mode
  }
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  return realIp ?? 'unknown';
}

/**
 * Pre-configured rate limit profiles.
 */
export const RATE_LIMITS = {
  /** Login: 5 attempts per 60 seconds */
  login: { maxRequests: 5, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Public endpoints: 10 requests per 60 seconds */
  public: { maxRequests: 10, windowMs: 60_000 } satisfies RateLimitConfig,
  /** CPF validation: 3 attempts per 60 seconds */
  cpfValidation: { maxRequests: 3, windowMs: 60_000 } satisfies RateLimitConfig,
  /** General API: 100 requests per 60 seconds */
  api: { maxRequests: 100, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;
