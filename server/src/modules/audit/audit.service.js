import { AuditLog } from './auditLog.model.js';
import { toAuditEntryDTO } from './dto/auditEntry.dto.js';

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
   * Accepts validated query params (DTO field names) and maps them to model fields.
   */
  async getLogs({ page = 1, limit = 50, action, userId, resource, dateFrom, dateTo } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (action) query.action = action;
    if (userId) query.adminId = userId;
    if (resource) query.targetType = resource;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
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
      logs: logs.map(toAuditEntryDTO),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get audit log for a specific target.
   */
  async getLogsForTarget(targetType, targetId) {
    const logs = await AuditLog.find({ targetType, targetId })
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return logs.map(toAuditEntryDTO);
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
