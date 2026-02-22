import { Order } from '../modules/orders/order.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { AuditLog } from '../modules/audit/auditLog.model.js';

/**
 * Scheduled cleanup jobs.
 * Token cleanup is handled automatically by MongoDB TTL index on Token model.
 * Notification cleanup is handled by TTL index (90 days) on Notification model.
 */

/**
 * Cancel stale pending orders older than 24 hours.
 * These are orders where the user started checkout but never completed payment.
 */
async function cleanupStaleOrders() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

  const result = await Order.updateMany(
    { status: 'pending', createdAt: { $lt: cutoff } },
    { $set: { status: 'expired' } }
  );

  if (result.modifiedCount > 0) {
    console.log(`[CRON] Cleaned up ${result.modifiedCount} stale pending orders`);
  }

  return result.modifiedCount;
}

/**
 * Clean up read notifications older than 30 days to keep the DB lean.
 * Unread notifications are kept up to their 90-day TTL.
 */
async function cleanupOldReadNotifications() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  const result = await Notification.deleteMany({
    read: true,
    createdAt: { $lt: cutoff },
  });

  if (result.deletedCount > 0) {
    console.log(`[CRON] Cleaned up ${result.deletedCount} old read notifications`);
  }

  return result.deletedCount;
}

/**
 * Clean up old audit logs older than 1 year to keep the DB manageable.
 */
async function cleanupOldAuditLogs() {
  const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago

  const result = await AuditLog.deleteMany({
    createdAt: { $lt: cutoff },
  });

  if (result.deletedCount > 0) {
    console.log(`[CRON] Cleaned up ${result.deletedCount} old audit logs`);
  }

  return result.deletedCount;
}

/**
 * Clean up expired refresh tokens from user documents.
 */
async function cleanupExpiredRefreshTokens() {
  const { User } = await import('../modules/users/user.model.js');

  const result = await User.updateMany(
    { 'refreshTokens.expiresAt': { $lt: new Date() } },
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  );

  if (result.modifiedCount > 0) {
    console.log(`[CRON] Cleaned expired refresh tokens from ${result.modifiedCount} users`);
  }

  return result.modifiedCount;
}

/**
 * Run all cleanup jobs. Call this on a schedule (e.g., every hour).
 */
export async function runCleanupJobs() {
  console.log('[CRON] Running cleanup jobs...');
  try {
    await Promise.all([
      cleanupStaleOrders(),
      cleanupOldReadNotifications(),
      cleanupOldAuditLogs(),
      cleanupExpiredRefreshTokens(),
    ]);
    console.log('[CRON] Cleanup jobs completed');
  } catch (err) {
    console.error('[CRON] Cleanup job error:', err);
  }
}

/**
 * Start the cleanup cron loop. Runs every hour.
 */
export function startCleanupScheduler() {
  const INTERVAL = 60 * 60 * 1000; // 1 hour

  // Run once on startup (delayed 30s to let DB connect)
  setTimeout(() => runCleanupJobs(), 30 * 1000);

  // Then run every hour
  const timer = setInterval(() => runCleanupJobs(), INTERVAL);

  // Allow graceful shutdown to clear interval
  return timer;
}
