import { ReportQueryService } from './report.queryService.js';
import { ReportWriteService } from './report.writeService.js';

const queryService = new ReportQueryService();
const writeService = new ReportWriteService();

/**
 * Backward-compatible facade delegating to ReportQueryService / ReportWriteService.
 */
export class ReportService {
  // ── Reads ────────────────────────────────────────────
  getReports(opts)          { return queryService.getReports(opts); }
  getReportById(reportId)   { return queryService.getReportById(reportId); }
  getReportStats()          { return queryService.getReportStats(); }

  // ── Writes ───────────────────────────────────────────
  createReport(reporterId, data)                    { return writeService.createReport(reporterId, data); }
  resolveReport(reportId, adminId, data)             { return writeService.resolveReport(reportId, adminId, data); }
  dismissReport(reportId, adminId, data)             { return writeService.dismissReport(reportId, adminId, data); }
}
