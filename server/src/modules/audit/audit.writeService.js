import { AuditLog } from './auditLog.model.js';

export class AuditWriteService {
  /**
   * Log an admin action (fire-and-forget safe).
   */
  static async log({ adminId, action, targetType, targetId, details, req }) {
    try {
      await AuditLog.create({
        adminId,
        action,
        targetType,
        targetId,
        details,
        ipAddress: req?.ip,
        userAgent: req?.get?.('user-agent'),
      });
    } catch (err) {
      console.error('Audit log failed:', err.message);
    }
  }
}
