/**
 * Shape a Refund document (or lean object) into a consistent API response DTO.
 *
 * Handles both raw ObjectIds and populated sub-documents for
 * orderId, userId (buyerId), and processedBy fields.
 */
export function toRefundDTO(doc) {
  if (!doc) return null;

  return {
    _id: doc._id,
    orderId: doc.orderId?._id || doc.orderId,
    userId: doc.buyerId?._id || doc.buyerId,
    amount: doc.amount,
    reason: doc.reason,
    status: doc.status,
    adminNotes: doc.adminNote || null,
    processedBy: doc.processedBy?._id || doc.processedBy || null,
    processedAt: doc.processedAt || null,
    createdAt: doc.createdAt,
  };
}
