import jwt from 'jsonwebtoken';
import { rbacService } from '../modules/rbac/rbac.service.js';
import { getCachedUser } from '../lib/userCache.js';
import logger from '../lib/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    const user = await getCachedUser(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Resolve permissions from role + customPermissions (cached, no extra DB query)
    const permissions = await rbacService.resolveUserPermissions(user);
    req.user = user;
    req.user.permissions = permissions;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// ── Legacy role-based authorization ──────────────────────────────────────────
// DEPRECATED: Use can() instead. These are kept only for backward compatibility
// and will be removed in a future release.

/** @deprecated Use can('permission.name') instead. */
export const authorize = (...roles) => {
  if (process.env.NODE_ENV === 'development') {
    logger.warn({ roles }, 'authorize() is deprecated, use can(\'permission\') instead');
  }
  return (req, res, next) => {
    if (req.user.role === 'super_admin') return next();
    if (roles.includes('admin') && req.user.role === 'admin') return next();
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

/** @deprecated Use can('dashboard.admin') instead. */
export const requireAdmin = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.warn('requireAdmin is deprecated, use can(\'dashboard.admin\') instead');
  }
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

/** @deprecated Use requireSuperAdmin sparingly — prefer can() for most checks. */
export const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }
  next();
};

// ── New permission-based authorization ───────────────────────────────────────

/**
 * Permission-based authorization middleware.
 * Checks if the authenticated user has ANY of the required permissions.
 *
 * Usage:
 *   can('templates.approve')                          // single permission
 *   can('templates.approve', 'templates.delete')      // any of these
 *
 * @param {...string} requiredPermissions
 */
export const can = (...requiredPermissions) => {
  return (req, res, next) => {
    // super_admin always passes
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!req.user.permissions || req.user.permissions.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    const hasAccess = requiredPermissions.some(perm =>
      rbacService.hasPermission(req.user.permissions, perm)
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: `Missing required permission: ${requiredPermissions.join(' or ')}`,
      });
    }

    next();
  };
};

// ── Optional auth (unchanged) ────────────────────────────────────────────────

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.accessToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
      const user = await getCachedUser(decoded.userId);
      if (user) {
        const permissions = await rbacService.resolveUserPermissions(user);
        req.user = user;
        req.user.permissions = permissions;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
