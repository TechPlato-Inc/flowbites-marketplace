import { AuditService } from './audit.service.js';

const auditService = new AuditService();

export class AuditController {
  async getLogs(req, res, next) {
    try {
      const data = await auditService.getLogs(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getLogsForTarget(req, res, next) {
    try {
      const data = await auditService.getLogsForTarget(req.params.targetType, req.params.targetId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const data = await auditService.getStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
