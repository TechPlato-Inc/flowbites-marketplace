import { RefundQueryService } from './refund.queryService.js';
import { RefundWriteService } from './refund.writeService.js';
import { toRefundDTO } from './dto/refund.dto.js';

const queryService = new RefundQueryService();
const writeService = new RefundWriteService();

export class RefundController {
  // POST /refunds/request — buyer requests refund
  async requestRefund(req, res, next) {
    try {
      const refund = await writeService.requestRefund(
        req.user._id,
        req.body.orderId,
        req.body.reason
      );
      res.status(201).json({ success: true, data: toRefundDTO(refund) });
    } catch (error) {
      next(error);
    }
  }

  // GET /refunds/order/:orderId — buyer checks refund status
  async getRefundByOrder(req, res, next) {
    try {
      const refund = await queryService.getRefundByOrder(req.user._id, req.params.orderId);
      res.json({ success: true, data: toRefundDTO(refund) });
    } catch (error) {
      next(error);
    }
  }

  // GET /refunds/admin — admin lists all refund requests
  async getRefunds(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const data = await queryService.getRefunds({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        status,
      });
      res.json({
        success: true,
        data: {
          refunds: data.refunds.map(toRefundDTO),
          pagination: data.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /refunds/admin/:refundId/approve — admin approves refund
  async approveRefund(req, res, next) {
    try {
      const refund = await writeService.approveRefund(req.user._id, req.params.refundId);
      res.json({ success: true, data: toRefundDTO(refund) });
    } catch (error) {
      next(error);
    }
  }

  // POST /refunds/admin/:refundId/reject — admin rejects refund
  async rejectRefund(req, res, next) {
    try {
      const refund = await writeService.rejectRefund(
        req.user._id,
        req.params.refundId,
        req.body.adminNote
      );
      res.json({ success: true, data: toRefundDTO(refund) });
    } catch (error) {
      next(error);
    }
  }

  // POST /refunds/admin/:refundId/process — admin processes refund (approve or reject via body)
  async processRefund(req, res, next) {
    try {
      const { status, adminNotes } = req.body;
      let refund;

      if (status === 'approved') {
        refund = await writeService.approveRefund(req.user._id, req.params.refundId);
      } else {
        refund = await writeService.rejectRefund(
          req.user._id,
          req.params.refundId,
          adminNotes
        );
      }

      res.json({ success: true, data: toRefundDTO(refund) });
    } catch (error) {
      next(error);
    }
  }
}
