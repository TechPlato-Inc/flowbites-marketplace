import { Report } from './report.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ReportQueryService {
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
