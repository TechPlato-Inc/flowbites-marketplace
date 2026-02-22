import { ReportService } from './report.service.js';

const reportService = new ReportService();

export class ReportController {
  async createReport(req, res, next) {
    try {
      const data = await reportService.createReport(req.user._id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const data = await reportService.getReports(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req, res, next) {
    try {
      const data = await reportService.getReportById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const data = await reportService.resolveReport(req.params.id, req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async dismissReport(req, res, next) {
    try {
      const data = await reportService.dismissReport(req.params.id, req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getReportStats(req, res, next) {
    try {
      const data = await reportService.getReportStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
