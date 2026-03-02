import { ReportQueryService } from './report.queryService.js';
import { ReportWriteService } from './report.writeService.js';
import { toReportDTO } from './dto/report.dto.js';
import { listReportsQuerySchema } from './report.validator.js';

const queryService = new ReportQueryService();
const writeService = new ReportWriteService();

export class ReportController {
  async createReport(req, res, next) {
    try {
      const report = await writeService.createReport(req.user._id, req.body);
      res.status(201).json({ success: true, data: toReportDTO(report) });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const parsed = listReportsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const { reports, pagination } = await queryService.getReports(parsed.data);
      res.json({ success: true, data: { reports: reports.map(toReportDTO), pagination } });
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req, res, next) {
    try {
      const report = await queryService.getReportById(req.params.id);
      res.json({ success: true, data: toReportDTO(report) });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const report = await writeService.resolveReport(req.params.id, req.user._id, req.body);
      res.json({ success: true, data: toReportDTO(report) });
    } catch (error) {
      next(error);
    }
  }

  async dismissReport(req, res, next) {
    try {
      const report = await writeService.dismissReport(req.params.id, req.user._id, req.body);
      res.json({ success: true, data: toReportDTO(report) });
    } catch (error) {
      next(error);
    }
  }

  async getReportStats(req, res, next) {
    try {
      const data = await queryService.getReportStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
