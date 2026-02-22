import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['template', 'service'],
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  servicePackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePackage'
  },
  title: String,
  price: Number,
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  platformFee: Number,
  creatorPayout: Number
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],

  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0,
  },
  couponCode: String,
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Payment
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'expired'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'mock'],
    default: 'stripe'
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,

  // Metadata
  buyerEmail: String,
  ipAddress: String,
  paidAt: Date
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ stripeChargeId: 1 });
orderSchema.index({ stripePaymentIntentId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `FLW-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
