/**
 * Shape a Report document (or lean object) into a consistent API response.
 */
export function toReportDTO(doc) {
  return {
    _id: doc._id,
    reporterId: doc.reporterId?._id || doc.reporterId,
    reporter: doc.reporterId && doc.reporterId._id ? {
      _id: doc.reporterId._id,
      name: doc.reporterId.name || null,
      email: doc.reporterId.email || null,
      avatar: doc.reporterId.avatar || null,
    } : null,
    targetType: doc.targetType,
    targetId: doc.targetId,
    reason: doc.reason,
    description: doc.description,
    status: doc.status,
    priority: doc.priority || null,
    resolution: doc.adminNote || null,
    adminNote: doc.adminNote || null,
    actionTaken: doc.actionTaken || null,
    resolvedBy: doc.resolvedBy?._id || doc.resolvedBy || null,
    resolvedByName: doc.resolvedBy && doc.resolvedBy.name ? doc.resolvedBy.name : null,
    resolvedAt: doc.resolvedAt || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
