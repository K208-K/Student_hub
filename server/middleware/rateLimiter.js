/**
 * Simple in-memory rate limiter middleware.
 * Limits each user to `maxRequests` per `windowMs` milliseconds.
 * Keyed by authenticated user ID (req.user._id).
 */

const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore) {
    if (now - data.windowStart > data.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimiter({ windowMs = 60 * 1000, maxRequests = 10, message = 'Too many requests, please try again later.' } = {}) {
  return (req, res, next) => {
    const userId = req.user?._id?.toString() || req.ip;
    const key = `${userId}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, windowStart: now, windowMs });
      return next();
    }

    const entry = rateLimitStore.get(key);

    // Reset window if expired
    if (now - entry.windowStart > windowMs) {
      entry.count = 1;
      entry.windowStart = now;
      return next();
    }

    // Within window — check limit
    entry.count++;
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        message,
        retryAfter,
      });
    }

    next();
  };
}

module.exports = rateLimiter;
