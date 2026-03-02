import mongoose from 'mongoose';
import crypto from 'crypto';

const affiliateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  commissionRate: {
    type: Number,
    default: 30, // percentage
    min: 0,
    max: 100
  },
  cookieDurationDays: {
    type: Number,
    default: 90
  },

  // Application info
  website: { type: String, trim: true },
  promotionMethod: { type: String, trim: true, maxlength: 1000 },
  rejectionReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,

  // Lifetime stats
  stats: {
    totalClicks: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },
    paidEarnings: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// referralCode and userId already indexed via `unique: true`
affiliateSchema.index({ status: 1, createdAt: -1 });

// Generate a unique referral code before saving
affiliateSchema.pre('validate', async function (next) {
  if (!this.referralCode) {
    let code;
    let exists = true;
    while (exists) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      exists = await mongoose.model('Affiliate').findOne({ referralCode: code });
    }
    this.referralCode = code;
  }
  next();
});

export const Affiliate = mongoose.model('Affiliate', affiliateSchema);

// ── Referral Click Tracking ──────────────────────────────────────────────────

const referralClickSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  referralCode: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  page: String
}, {
  timestamps: true
});

referralClickSchema.index({ affiliateId: 1, createdAt: -1 });
referralClickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400 }); // TTL: 90 days

export const ReferralClick = mongoose.model('ReferralClick', referralClickSchema);

// ── Referral Conversion ──────────────────────────────────────────────────────

const referralConversionSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true // one conversion per order
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderTotal: {
    type: Number,
    required: true
  },
  commissionRate: {
    type: Number,
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid', 'refunded'],
    default: 'pending'
  },
  paidAt: Date
}, {
  timestamps: true
});

referralConversionSchema.index({ affiliateId: 1, createdAt: -1 });
referralConversionSchema.index({ status: 1 });
// orderId already indexed via `unique: true`

export const ReferralConversion = mongoose.model('ReferralConversion', referralConversionSchema);

// ── Affiliate Payout ─────────────────────────────────────────────────────────

const affiliatePayoutSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'paid', 'rejected'],
    default: 'requested'
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  rejectionReason: String,
  notes: String
}, {
  timestamps: true
});

affiliatePayoutSchema.index({ affiliateId: 1, createdAt: -1 });
affiliatePayoutSchema.index({ status: 1, createdAt: -1 });

export const AffiliatePayout = mongoose.model('AffiliatePayout', affiliatePayoutSchema);
