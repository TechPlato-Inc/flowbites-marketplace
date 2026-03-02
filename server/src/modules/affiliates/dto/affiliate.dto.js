export function toAffiliateDTO(doc) {
  return {
    _id: doc._id,
    referralCode: doc.referralCode,
    status: doc.status,
    commissionRate: doc.commissionRate,
    cookieDurationDays: doc.cookieDurationDays,
    website: doc.website || null,
    promotionMethod: doc.promotionMethod || null,
    stats: {
      totalClicks: doc.stats?.totalClicks || 0,
      totalReferrals: doc.stats?.totalReferrals || 0,
      totalEarnings: doc.stats?.totalEarnings || 0,
      pendingEarnings: doc.stats?.pendingEarnings || 0,
      paidEarnings: doc.stats?.paidEarnings || 0,
    },
    createdAt: doc.createdAt,
  };
}

export function toAffiliatePayoutDTO(doc) {
  return {
    _id: doc._id,
    amount: doc.amount,
    status: doc.status,
    paymentMethod: doc.paymentMethod,
    processedAt: doc.processedAt || null,
    rejectionReason: doc.rejectionReason || null,
    notes: doc.notes || null,
    createdAt: doc.createdAt,
  };
}

export function toReferralConversionDTO(doc) {
  return {
    _id: doc._id,
    orderId: doc.orderId,
    buyer: doc.buyerId ? {
      _id: doc.buyerId._id || doc.buyerId,
      name: doc.buyerId.name || null,
      avatar: doc.buyerId.avatar || null,
    } : null,
    orderTotal: doc.orderTotal,
    commissionRate: doc.commissionRate,
    commissionAmount: doc.commissionAmount,
    status: doc.status,
    paidAt: doc.paidAt || null,
    createdAt: doc.createdAt,
  };
}
