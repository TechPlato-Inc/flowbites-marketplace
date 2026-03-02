/**
 * Shape a Withdrawal Mongoose document (or lean object) into an API‐safe DTO.
 *
 * Returned shape:
 *   _id, userId, amount, paymentMethod, status,
 *   processedAt, rejectionReason, createdAt
 */
export function toWithdrawalDTO(doc) {
  return {
    _id: doc._id,
    userId: doc.creatorId?._id || doc.creatorId,
    amount: doc.amount,
    paymentMethod: doc.payoutMethod || null,
    status: doc.status,
    processedAt: doc.processedAt || null,
    rejectionReason: doc.adminNote || null,
    createdAt: doc.createdAt,
  };
}

/**
 * Admin-facing DTO that includes the populated creator info and processing
 * details that are not exposed to regular users.
 */
export function toAdminWithdrawalDTO(doc) {
  return {
    ...toWithdrawalDTO(doc),
    creator: doc.creatorId && typeof doc.creatorId === 'object' ? {
      _id: doc.creatorId._id,
      name: doc.creatorId.name || null,
      email: doc.creatorId.email || null,
      avatar: doc.creatorId.avatar || null,
    } : null,
    note: doc.note || null,
    adminNote: doc.adminNote || null,
    stripeTransferId: doc.stripeTransferId || null,
    processedBy: doc.processedBy?._id
      ? { _id: doc.processedBy._id, name: doc.processedBy.name || null }
      : doc.processedBy || null,
    completedAt: doc.completedAt || null,
  };
}
