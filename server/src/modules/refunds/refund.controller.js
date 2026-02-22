import { RefundService } from './refund.service.js';

const refundService = new RefundService();

export class RefundController {
  // POST /refunds/request — buyer requests refund
  async requestRefund(req, res, next) {
    try {
      const refund = await refundService.requestRefund(
        req.user._id,
        req.body.orderId,
        req.body.reason
      );
      res.status(201).json({ success: true, data: refund });
    } catch (error) {
      next(error);
    }
  }

  // GET /refunds/order/:orderId — buyer checks refund status
  async getRefundByOrder(req, res, next) {
    try {
      const refund = await refundService.getRefundByOrder(req.user._id, req.params.orderId);
      res.json({ success: true, data: refund });
    } catch (error) {
      next(error);
    }
  }

  // GET /refunds/admin — admin lists all refund requests
  async getRefunds(req, res, next) {
    try {
      const data = await refundService.getRefunds({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        status: req.query.status,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /refunds/admin/:refundId/approve — admin approves refund
  async approveRefund(req, res, next) {
    try {
      const refund = await refundService.approveRefund(req.user._id, req.params.refundId);
      res.json({ success: true, data: refund });
    } catch (error) {
      next(error);
    }
  }

  // POST /refunds/admin/:refundId/reject — admin rejects refund
  async rejectRefund(req, res, next) {
    try {
      const refund = await refundService.rejectRefund(
        req.user._id,
        req.params.refundId,
        req.body.adminNote
      );
      res.json({ success: true, data: refund });
    } catch (error) {
      next(error);
    }
  }
}
