/**
 * Per-user rate limiter to prevent abuse on specific endpoints.
 * Uses in-memory tracking (works for single-server deployments).
 * For multi-server, swap to Redis-based implementation.
 */

const userRequests = new Map();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of userRequests) {
    if (now > data.resetAt) {
      userRequests.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Create a per-user rate limiter.
 * @param {object} options
 * @param {number} options.maxRequests — max requests per window (default: 30)
 * @param {number} options.windowMs — window in milliseconds (default: 60000 = 1 min)
 * @param {string} options.message — error message when rate limited
 */
export function userRateLimit({
  maxRequests = 30,
  windowMs = 60 * 1000,
  message = 'Too many requests, please slow down',
} = {}) {
  return (req, res, next) => {
    // Only rate limit authenticated users
    const userId = req.user?._id?.toString();
    if (!userId) return next();

    const key = `${userId}:${req.route?.path || req.path}`;
    const now = Date.now();

    let entry = userRequests.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      userRequests.set(key, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    next();
  };
}
