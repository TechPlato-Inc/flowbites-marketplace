export function toLicenseDTO(doc) {
  return {
    _id: doc._id,
    userId: doc.buyerId?._id || doc.buyerId,
    templateId: doc.templateId?._id || doc.templateId,
    template: doc.templateId && doc.templateId._id ? {
      _id: doc.templateId._id,
      title: doc.templateId.title || null,
      thumbnail: doc.templateId.thumbnail || null,
      price: doc.templateId.price || null,
      platform: doc.templateId.platform || null,
      deliveryType: doc.templateId.deliveryType || null,
      deliveryUrl: doc.templateId.deliveryUrl || null,
      templateFile: doc.templateId.templateFile || null,
    } : null,
    orderId: doc.orderId?._id || doc.orderId,
    order: doc.orderId && doc.orderId._id ? {
      _id: doc.orderId._id,
      orderNumber: doc.orderId.orderNumber || null,
      paidAt: doc.orderId.paidAt || null,
    } : null,
    licenseType: doc.licenseType,
    licenseKey: doc.licenseKey,
    downloadCount: doc.downloadCount,
    maxDownloads: doc.maxDownloads,
    isActive: doc.isActive,
    expiresAt: doc.expiresAt || null,
    lastDownloadedAt: doc.lastDownloadedAt || null,
    createdAt: doc.createdAt,
  };
}
