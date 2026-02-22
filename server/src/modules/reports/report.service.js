import { Report } from './report.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendReportResolved } from '../../services/email.js';

const notificationService = new NotificationService();

export class ReportService {
  /**
   * Create a content report.
   */
  async createReport(reporterId, { targetType, targetId, reason, description }) {
    const existing = await Report.findOne({ reporterId, targetType, targetId });
    if (existing) {
      throw new AppError('You have already reported this content', 400);
    }

    // Auto-escalate copyright and scam reports
    const priority = ['copyright_violation', 'scam'].includes(reason) ? 'high' : 'medium';

    const report = await Report.create({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
      priority,
    });

    return report;
  }

  /**
   * Get all reports (admin).
   */
  async getReports({ page = 1, limit = 20, status, targetType, priority } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (status) query.status = status;
    if (targetType) query.targetType = targetType;
    if (priority) query.priority = priority;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporterId', 'name email avatar')
        .populate('resolvedBy', 'name')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single report by ID (admin).
   */
  async getReportById(reportId) {
    const report = await Report.findById(reportId)
      .populate('reporterId', 'name email avatar')
      .populate('resolvedBy', 'name')
      .lean();
    if (!report) throw new AppError('Report not found', 404);
    return report;
  }

  /**
   * Resolve a report (admin).
   */
  async resolveReport(reportId, adminId, { adminNote, actionTaken }) {
    const report = await Report.findById(reportId);
    if (!report) throw new AppError('Report not found', 404);

    if (report.status === 'resolved' || report.status === 'dismissed') {
      throw new AppError('Report is already closed', 400);
    }

    report.status = 'resolved';
    report.adminNote = adminNote;
    report.actionTaken = actionTaken || 'none';
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    await report.save();

    // Audit log
    AuditLog.create({
      adminId,
      action: 'report_resolved',
      targetType: 'report',
      targetId: reportId,
      details: { actionTaken, targetType: report.targetType, targetId: report.targetId },
    }).catch(() => {});

    // Notify reporter (non-blocking)
    notificationService.notifyReportResolved(report.reporterId, actionTaken).catch(() => {});
    User.findById(report.reporterId).then(user => {
      if (user) sendReportResolved(user.email, user.name, actionTaken).catch(() => {});
    }).catch(() => {});

    return report;
  }

  /**
   * Dismiss a report (admin).
   */
  async dismissReport(reportId, adminId, { adminNote } = {}) {
    const report = await Report.findById(reportId);
    if (!report) throw new AppError('Report not found', 404);

    if (report.status === 'resolved' || report.status === 'dismissed') {
      throw new AppError('Report is already closed', 400);
    }

    report.status = 'dismissed';
    report.adminNote = adminNote;
    report.resolvedBy = adminId;
    report.resolvedAt = new Date();
    await report.save();

    AuditLog.create({
      adminId,
      action: 'report_dismissed',
      targetType: 'report',
      targetId: reportId,
      details: { targetType: report.targetType, targetId: report.targetId },
    }).catch(() => {});

    return report;
  }

  /**
   * Get report stats for admin dashboard.
   */
  async getReportStats() {
    const [total, pending, byReason] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: '$reason', count: { $sum: 1 } } },
      ]),
    ]);

    const reasons = {};
    byReason.forEach(r => { reasons[r._id] = r.count; });

    return { total, pending, byReason: reasons };
  }
}
