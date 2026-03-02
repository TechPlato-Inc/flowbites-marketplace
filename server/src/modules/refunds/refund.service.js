import { RefundQueryService } from './refund.queryService.js';
import { RefundWriteService } from './refund.writeService.js';

const queryService = new RefundQueryService();
const writeService = new RefundWriteService();

/**
 * Backward-compatible facade delegating to RefundQueryService / RefundWriteService.
 */
export class RefundService {
  // ── Reads ────────────────────────────────────────────
  getRefunds(opts)                  { return queryService.getRefunds(opts); }
  getRefundByOrder(buyerId, orderId) { return queryService.getRefundByOrder(buyerId, orderId); }

  // ── Writes ───────────────────────────────────────────
  requestRefund(buyerId, orderId, reason) { return writeService.requestRefund(buyerId, orderId, reason); }
  approveRefund(adminId, refundId)        { return writeService.approveRefund(adminId, refundId); }
  rejectRefund(adminId, refundId, adminNote) { return writeService.rejectRefund(adminId, refundId, adminNote); }
}
