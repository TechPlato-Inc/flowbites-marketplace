import { AuditLog } from './auditLog.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AuditService {
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

  /**
   * Get audit logs with filters (admin).
   */
  async getLogs({ page = 1, limit = 50, action, adminId, targetType, startDate, endDate } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (action) query.action = action;
    if (adminId) query.adminId = adminId;
    if (targetType) query.targetType = targetType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('adminId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get audit log for a specific target.
   */
  async getLogsForTarget(targetType, targetId) {
    return AuditLog.find({ targetType, targetId })
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  /**
   * Get audit stats summary.
   */
  async getStats() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, recentCount, byAction] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: last24h } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const actions = {};
    byAction.forEach(a => { actions[a._id] = a.count; });

    return { total, last24h: recentCount, recentActions: actions };
  }
}
