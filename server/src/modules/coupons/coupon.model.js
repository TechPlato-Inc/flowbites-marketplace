import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 30,
  },
  description: {
    type: String,
    maxlength: 200,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  applicableTo: {
    type: String,
    enum: ['all', 'templates', 'services'],
    default: 'all',
  },
  specificTemplates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
  }],
  startsAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, expiresAt: 1 });
couponSchema.index({ isActive: 1, createdAt: -1 });

export const Coupon = mongoose.model('Coupon', couponSchema);

// Track per-user coupon usage
const couponUsageSchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  discountApplied: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

couponUsageSchema.index({ couponId: 1, userId: 1 });
couponUsageSchema.index({ userId: 1, createdAt: -1 });

export const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);
