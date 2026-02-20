import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens and underscores']
  },
  bio: {
    type: String,
    maxlength: 500
  },
  website: String,
  twitter: String,
  dribbble: String,
  github: String,
  portfolio: String,
  coverImage: String,

  // Onboarding
  onboarding: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'approved', 'rejected'],
      default: 'pending'
    },
    completedSteps: {
      type: [String],
      default: []
    },
    submittedAt: Date,
    reviewedAt: Date,
    rejectionReason: String,

    // Personal Info
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },

    // Government ID
    govIdType: {
      type: String,
      enum: ['passport', 'national_id', 'drivers_license'],
    },
    govIdFront: String,
    govIdBack: String,
    govIdNumber: String,

    // ID Card / Selfie
    selfieWithId: String,

    // Bank Details
    bankName: String,
    bankAccountName: String,
    bankAccountNumber: String,
    bankRoutingNumber: String,
    bankSwiftCode: String,
    bankCountry: String,

    // Creator Reference
    referenceCreatorUsername: String,
    referenceCreatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreatorProfile'
    },
    referenceNote: String,
    referenceVerified: { type: Boolean, default: false }
  },

  // Creator stats
  stats: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    templateCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    followers: { type: Number, default: 0 }
  },

  // Business info
  payoutEmail: String,
  stripeAccountId: String,

  // Featured/verified
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free'
    },
    startedAt: Date,
    expiresAt: Date
  }
}, {
  timestamps: true
});

// Indexes
creatorProfileSchema.index({ 'stats.totalSales': -1 });
creatorProfileSchema.index({ createdAt: -1 });

export const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);
