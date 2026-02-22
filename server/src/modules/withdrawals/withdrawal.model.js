import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [10, 'Minimum withdrawal is $10']
  },
  currency: {
    type: String,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  payoutMethod: {
    type: String,
    enum: ['stripe_connect', 'bank_transfer', 'paypal'],
    default: 'stripe_connect'
  },
  payoutDetails: {
    stripeAccountId: String,
    bankName: String,
    accountLast4: String,
    paypalEmail: String,
  },
  stripeTransferId: String,
  note: String,
  adminNote: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  completedAt: Date,
}, {
  timestamps: true
});

withdrawalSchema.index({ creatorId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ creatorId: 1, status: 1, createdAt: -1 });
withdrawalSchema.index(
  { creatorId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
    name: 'one_pending_withdrawal_per_creator',
  }
);

export const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
