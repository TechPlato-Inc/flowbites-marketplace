import { WithdrawalQueryService } from './withdrawal.queryService.js';
import { WithdrawalWriteService } from './withdrawal.writeService.js';

const queryService = new WithdrawalQueryService();
const writeService = new WithdrawalWriteService();

export class WithdrawalController {
  // GET /withdrawals/balance
  async getBalance(req, res, next) {
    try {
      const data = await queryService.getBalance(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /withdrawals/request  (validated by createWithdrawalSchema)
  async requestWithdrawal(req, res, next) {
    try {
      const data = await writeService.requestWithdrawal(req.user._id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /withdrawals/my  (validated by listWithdrawalsQuerySchema)
  async getMyWithdrawals(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await queryService.getMyWithdrawals(req.user._id, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // ── Admin routes ───────────────────────────────────────────────────────────

  // GET /withdrawals/admin  (validated by listWithdrawalsQuerySchema)
  async getAllWithdrawals(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const data = await queryService.getAllWithdrawals({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        status,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /withdrawals/admin/:id/approve
  async approveWithdrawal(req, res, next) {
    try {
      const data = await writeService.approveWithdrawal(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /withdrawals/admin/:id/reject  (validated by rejectWithdrawalSchema)
  async rejectWithdrawal(req, res, next) {
    try {
      const data = await writeService.rejectWithdrawal(req.params.id, req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /withdrawals/admin/:id/complete  (validated by completeWithdrawalSchema)
  async completeWithdrawal(req, res, next) {
    try {
      const data = await writeService.completeWithdrawal(req.params.id, req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
