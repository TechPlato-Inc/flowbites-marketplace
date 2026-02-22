/**
 * Simple in-memory API response cache for public endpoints.
 * Caches GET responses for a configurable TTL to reduce database load.
 * Cache is stored per-URL (including query params).
 */

const cache = new Map();

/**
 * Create a caching middleware with a given TTL.
 * @param {number} ttlSeconds — time-to-live in seconds (default: 60)
 */
export function cacheResponse(ttlSeconds = 60) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      return res.json(cached.data);
    }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          data,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cached entries matching a URL prefix.
 * Call this when data changes (e.g., after template create/update).
 */
export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear entire cache.
 */
export function clearCache() {
  cache.clear();
}
