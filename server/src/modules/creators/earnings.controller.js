import { EarningsService } from './earnings.service.js';

const earningsService = new EarningsService();

export class EarningsController {
  async getEarningsSummary(req, res, next) {
    try {
      const data = await earningsService.getEarningsSummary(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req, res, next) {
    try {
      const data = await earningsService.getTransactions(req.user._id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
