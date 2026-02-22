import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  ip: String,
  success: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // auto-delete after 24 hours (TTL index)
  },
});

loginAttemptSchema.index({ email: 1, createdAt: -1 });
loginAttemptSchema.index({ ip: 1, createdAt: -1 });
loginAttemptSchema.index({ email: 1, success: 1, createdAt: -1 });

/**
 * Count recent failed attempts for an email within a time window.
 */
loginAttemptSchema.statics.countRecentFailures = async function (email, windowMs = 15 * 60 * 1000) {
  const since = new Date(Date.now() - windowMs);
  return this.countDocuments({ email, success: false, createdAt: { $gte: since } });
};

/**
 * Record a login attempt.
 */
loginAttemptSchema.statics.record = async function (email, ip, success) {
  return this.create({ email: email.toLowerCase(), ip, success });
};

/**
 * Clear failed attempts for an email (on successful login or password reset).
 */
loginAttemptSchema.statics.clearFailures = async function (email) {
  return this.deleteMany({ email: email.toLowerCase(), success: false });
};

export const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
