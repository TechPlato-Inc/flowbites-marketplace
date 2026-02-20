import mongoose from 'mongoose';
import slugify from 'slugify';

const servicePackageSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['webflow-development', 'framer-development', 'wix-development', 'custom-design', 'migration', 'other'],
    default: 'custom-design'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryDays: {
    type: Number,
    required: true,
    min: 1
  },
  revisions: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  features: [String],
  requirements: {
    type: String, // What buyer needs to provide
    default: ''
  },
  thumbnail: String,
  gallery: [String],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    orders: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Generate slug before saving
servicePackageSchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.model('ServicePackage').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

const serviceOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServicePackage',
    default: null
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Admin can reassign to a different creator
  assignedCreatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },

  // Generic customization request (no pre-existing service package)
  isGenericRequest: {
    type: Boolean,
    default: false
  },

  // Order details
  packageName: String,
  price: Number,
  deliveryDays: Number,
  revisions: Number,
  revisionsUsed: {
    type: Number,
    default: 0
  },

  // Requirements submitted by buyer
  requirements: {
    type: String,
    required: true
  },
  attachments: [String],

  // Status workflow
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled', 'disputed'],
    default: 'requested'
  },

  // Deliverables
  deliveryFiles: [String],
  deliveryNote: String,
  deliveredAt: Date,

  // Timeline
  acceptedAt: Date,
  completedAt: Date,
  dueDate: Date,

  // Payment
  stripeSessionId: String,
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  platformFee: Number,
  creatorPayout: Number,
  paymentReleased: {
    type: Boolean,
    default: false
  },

  // Dispute
  dispute: {
    reason: String,
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    openedAt: Date,
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    outcome: {
      type: String,
      enum: ['refund', 'release_payment', 'partial_refund', 'redo', null],
      default: null
    }
  },

  // Activity Log
  activityLog: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Communication
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    attachments: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
servicePackageSchema.index({ creatorId: 1, templateId: 1 });
servicePackageSchema.index({ templateId: 1, isActive: 1 });
servicePackageSchema.index({ isActive: 1, category: 1 });

serviceOrderSchema.index({ buyerId: 1, status: 1 });
serviceOrderSchema.index({ creatorId: 1, status: 1 });
serviceOrderSchema.index({ assignedCreatorId: 1, status: 1 });
serviceOrderSchema.index({ isGenericRequest: 1, status: 1 });
serviceOrderSchema.index({ status: 1, dueDate: 1 });

// Auto-generate order number
serviceOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('ServiceOrder').countDocuments();
    this.orderNumber = `SRV-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export const ServicePackage = mongoose.model('ServicePackage', servicePackageSchema);
export const ServiceOrder = mongoose.model('ServiceOrder', serviceOrderSchema);
