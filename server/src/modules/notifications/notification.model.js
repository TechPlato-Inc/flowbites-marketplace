import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'order_paid',
      'order_refunded',
      'template_approved',
      'template_rejected',
      'review_received',
      'review_moderated',
      'creator_approved',
      'creator_rejected',
      'refund_approved',
      'refund_rejected',
      'service_order_update',
      'withdrawal_approved',
      'withdrawal_rejected',
      'withdrawal_completed',
      'ticket_reply',
      'ticket_resolved',
      'report_resolved',
      'new_follower',
      'new_message',
      'order_expired',
      'payment_failed',
      'system',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    maxlength: 500,
  },
  link: String,
  read: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // Auto-delete after 90 days

export const Notification = mongoose.model('Notification', notificationSchema);
