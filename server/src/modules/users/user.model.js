import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    default: 'buyer'
  },
  customPermissions: [{
    type: String,
    trim: true,
  }],
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedAt: Date,
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  banReason: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailPreferences: {
    orderConfirmations: { type: Boolean, default: true },
    reviewNotifications: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: false },
    newFollowerAlert: { type: Boolean, default: true }
  },
  notificationPreferences: {
    orders: { type: Boolean, default: true },       // order_paid, order_refunded, order_expired, payment_failed
    templates: { type: Boolean, default: true },     // template_approved, template_rejected
    reviews: { type: Boolean, default: true },       // review_received, review_moderated
    services: { type: Boolean, default: true },      // service_order_update
    social: { type: Boolean, default: true },        // new_follower
    financial: { type: Boolean, default: true },     // withdrawal_*, refund_*
    support: { type: Boolean, default: true },       // ticket_reply, ticket_resolved, report_resolved
    account: { type: Boolean, default: true },       // creator_approved, creator_rejected
    system: { type: Boolean, default: true },        // system broadcasts
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isBanned: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Trim refreshTokens to max 5 (keep newest) before saving
userSchema.pre('save', function(next) {
  if (this.isModified('refreshTokens') && this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 5);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON, include runtime permissions
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  // Include runtime permissions resolved by auth middleware
  if (this.permissions) {
    obj.permissions = this.permissions;
  }
  return obj;
};

export const User = mongoose.model('User', userSchema);
