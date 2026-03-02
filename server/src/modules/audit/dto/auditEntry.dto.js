/**
 * Maps an AuditLog document (or lean object) to a safe, consistent DTO
 * that is returned to API consumers.
 *
 * Field mapping from model -> DTO:
 *   adminId    -> userId   (populated: name, email)
 *   targetType -> resource
 *   targetId   -> resourceId
 *   details    -> changes
 */
export function toAuditEntryDTO(doc) {
  return {
    _id: doc._id,
    action: doc.action,
    userId: doc.adminId
      ? {
          _id: doc.adminId._id || doc.adminId,
          name: doc.adminId.name || null,
          email: doc.adminId.email || null,
        }
      : null,
    resource: doc.targetType,
    resourceId: doc.targetId || null,
    changes: doc.details ?? {},
    ipAddress: doc.ipAddress || null,
    userAgent: doc.userAgent || null,
    createdAt: doc.createdAt,
  };
}
