import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_banned',
      'user_unbanned',
      'user_role_changed',
      'template_approved',
      'template_rejected',
      'template_deleted',
      'review_moderated',
      'refund_approved',
      'refund_rejected',
      'coupon_created',
      'coupon_updated',
      'coupon_deleted',
      'creator_approved',
      'creator_rejected',
      'report_resolved',
      'report_dismissed',
      'withdrawal_approved',
      'withdrawal_rejected',
      'ticket_resolved',
      'system_config_changed',
    ]
  },
  targetType: {
    type: String,
    enum: ['user', 'template', 'review', 'refund', 'coupon', 'creator', 'report', 'withdrawal', 'ticket', 'system'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true
});

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
