/**
 * CSRF protection via Origin/Referer header validation.
 *
 * Since the app uses httpOnly SameSite cookies for auth, cross-site
 * requests are already blocked in modern browsers.  This middleware
 * adds defense-in-depth by explicitly verifying that state-changing
 * requests (POST, PUT, PATCH, DELETE) originate from a trusted origin.
 */
export function csrfProtection(req, res, next) {
  // Only check state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  // Stripe webhooks send POST from Stripe servers — skip them
  if (req.path.startsWith('/api/webhooks')) return next();

  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  const allowedOrigins = [process.env.CLIENT_URL, process.env.SITE_URL].filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
    );
  }

  const trusted = allowedOrigins.filter(Boolean);

  // Check Origin header first (most reliable)
  if (origin) {
    if (trusted.includes(origin)) return next();
    return res.status(403).json({
      success: false,
      error: 'CSRF validation failed: untrusted origin',
    });
  }

  // Check X-Forwarded-Host (set by reverse proxies like Vercel rewrites)
  const forwardedHost = req.headers['x-forwarded-host'];
  if (forwardedHost) {
    const forwardedOrigin = `https://${forwardedHost}`;
    if (trusted.includes(forwardedOrigin)) return next();
  }

  // Fallback to Referer header
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (trusted.includes(refererOrigin)) return next();
    return res.status(403).json({
      success: false,
      error: 'CSRF validation failed: untrusted referer',
    });
  }

  // If neither header is present, allow in development (e.g. Postman, curl)
  // but block in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'CSRF validation failed: missing origin header',
    });
  }

  next();
}
