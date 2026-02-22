import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Refund reason is required'],
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'processed'],
    default: 'requested',
  },
  amount: {
    type: Number,
    required: true,
  },
  stripeRefundId: String,
  adminNote: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: Date,
}, {
  timestamps: true,
});

refundSchema.index({ orderId: 1 }, { unique: true });
refundSchema.index({ buyerId: 1, createdAt: -1 });
refundSchema.index({ status: 1, createdAt: -1 });

export const Refund = mongoose.model('Refund', refundSchema);
