import { z } from 'zod';
import { EarningsService } from './earnings.service.js';
import { toEarningsSummaryDTO, toTransactionsListDTO } from './dto/earnings.dto.js';

const earningsService = new EarningsService();

const earningsTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export class EarningsController {
  async getEarningsSummary(req, res, next) {
    try {
      const raw = await earningsService.getEarningsSummary(req.user._id);
      res.json({ success: true, data: toEarningsSummaryDTO(raw) });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const parsed = earningsTransactionsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const raw = await earningsService.getTransactions(req.user._id, parsed.data);
      res.json({ success: true, data: toTransactionsListDTO(raw) });
    } catch (error) {
      next(error);
    }
  }
}
