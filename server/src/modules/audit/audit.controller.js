import { AuditQueryService } from './audit.queryService.js';
import { AuditWriteService } from './audit.writeService.js';
import { listAuditLogsQuerySchema } from './audit.validator.js';

const auditQueryService = new AuditQueryService();

export class AuditController {
  // GET /audit — list audit logs with validated query params
  async getLogs(req, res, next) {
    try {
      const parsed = listAuditLogsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parsed.error.issues,
        });
      }
      const data = await auditQueryService.getLogs(parsed.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /audit/:targetType/:targetId — logs for a specific resource
  async getLogsForTarget(req, res, next) {
    try {
      const data = await auditQueryService.getLogsForTarget(
        req.params.targetType,
        req.params.targetId,
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /audit/stats — audit summary statistics
  async getStats(req, res, next) {
    try {
      const data = await auditQueryService.getStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
