export function toOrderSummaryDTO(doc) {
  return {
    _id: doc._id,
    orderNumber: doc.orderNumber,
    items: (doc.items || []).map(item => ({
      type: item.type,
      templateId: item.templateId?._id || item.templateId,
      title: item.title || item.templateId?.title,
      thumbnail: item.templateId?.thumbnail || null,
      price: item.price,
    })),
    subtotal: doc.subtotal,
    discount: doc.discount || 0,
    couponCode: doc.couponCode || null,
    total: doc.total,
    currency: doc.currency || 'USD',
    status: doc.status,
    paymentMethod: doc.paymentMethod,
    paidAt: doc.paidAt || null,
    createdAt: doc.createdAt,
  };
}

export function toOrderDetailDTO(doc) {
  return {
    ...toOrderSummaryDTO(doc),
    buyerEmail: doc.buyerEmail,
    referralCode: doc.referralCode || null,
    stripeChargeId: doc.stripeChargeId || null,
  };
}
