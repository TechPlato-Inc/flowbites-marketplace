import { Report } from './report.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendReportResolved } from '../../services/email.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class ReportWriteService {
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

    eventBus.emit(EVENTS.REPORT_CREATED, {
      reportId: report._id.toString(),
      reporterId: reporterId.toString(),
      targetType,
      targetId: targetId.toString(),
    });

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

    // Send reporter email (non-blocking) — keep email here since no email listener exists
    User.findById(report.reporterId).then(user => {
      if (user) sendReportResolved(user.email, user.name, actionTaken).catch(() => {});
    }).catch(() => {});

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.REPORT_RESOLVED, {
      reportId: report._id.toString(),
      reporterId: report.reporterId.toString(),
      actionTaken: report.actionTaken,
      status: 'resolved',
      resolvedBy: adminId.toString(),
    });

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

    // Emit domain event — audit listener handles logging
    eventBus.emit(EVENTS.REPORT_RESOLVED, {
      reportId: report._id.toString(),
      reporterId: report.reporterId.toString(),
      actionTaken: 'dismissed',
      status: 'dismissed',
      resolvedBy: adminId.toString(),
    });

    return report;
  }
}
