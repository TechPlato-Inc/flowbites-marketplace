import { User } from '../modules/users/user.model.js';

const CACHE_TTL = 60_000; // 60 seconds
const MAX_ENTRIES = 500;

/** @type {Map<string, { user: object, expiresAt: number }>} */
const cache = new Map();

/**
 * Get user by ID with in-memory caching.
 * Returns a lean user object (no password) or null.
 */
export async function getCachedUser(userId, selectFields = '-password') {
  const key = `${userId}:${selectFields}`;
  const now = Date.now();

  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  const user = await User.findById(userId).select(selectFields);
  if (user) {
    // Evict oldest entries if over limit
    if (cache.size >= MAX_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(key, { user, expiresAt: now + CACHE_TTL });
  }

  return user;
}

/**
 * Invalidate cached user on logout, ban, or role change.
 */
export function clearUserCache(userId) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear entire cache (for testing or shutdown).
 */
export function clearAllUserCache() {
  cache.clear();
}
