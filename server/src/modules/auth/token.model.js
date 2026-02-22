import mongoose from 'mongoose';
import crypto from 'crypto';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Auto-delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ userId: 1, type: 1 });

tokenSchema.statics.createToken = async function (userId, type, expiresInMs) {
  // Remove any existing tokens of this type for this user
  await this.deleteMany({ userId, type });

  const token = crypto.randomBytes(32).toString('hex');

  return this.create({
    userId,
    token,
    type,
    expiresAt: new Date(Date.now() + expiresInMs),
  });
};

export const Token = mongoose.model('Token', tokenSchema);
