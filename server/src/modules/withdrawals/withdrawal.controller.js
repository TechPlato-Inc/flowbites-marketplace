import { WithdrawalService } from './withdrawal.service.js';

const withdrawalService = new WithdrawalService();

export class WithdrawalController {
  async getBalance(req, res, next) {
    try {
      const data = await withdrawalService.getBalance(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async requestWithdrawal(req, res, next) {
    try {
      const data = await withdrawalService.requestWithdrawal(req.user._id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMyWithdrawals(req, res, next) {
    try {
      const data = await withdrawalService.getMyWithdrawals(req.user._id, req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Admin routes
  async getAllWithdrawals(req, res, next) {
    try {
      const data = await withdrawalService.getAllWithdrawals(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async approveWithdrawal(req, res, next) {
    try {
      const data = await withdrawalService.approveWithdrawal(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async rejectWithdrawal(req, res, next) {
    try {
      const data = await withdrawalService.rejectWithdrawal(req.params.id, req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async completeWithdrawal(req, res, next) {
    try {
      const data = await withdrawalService.completeWithdrawal(req.params.id, req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
