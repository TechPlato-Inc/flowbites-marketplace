import mongoose from 'mongoose';
import slugify from 'slugify';

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },

  // Creator info
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreatorProfile',
    required: true
  },

  // Platform
  platform: {
    type: String,
    enum: ['webflow', 'framer', 'wix'],
    required: [true, 'Platform is required']
  },

  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],

  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Delivery method (platform-specific)
  deliveryType: {
    type: String,
    enum: ['clone_link', 'remix_link', 'file_download'],
    default: function() {
      if (this.platform === 'webflow') return 'clone_link';
      if (this.platform === 'framer') return 'remix_link';
      return 'file_download';
    }
  },
  deliveryUrl: {
    type: String,
    trim: true
  },

  // Files
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required']
  },
  gallery: [{
    type: String
  }],
  templateFile: {
    type: String
    // Not required — clone_link and remix_link templates use deliveryUrl instead
  },
  fileSize: {
    type: Number // in bytes
  },

  // License
  licenseType: {
    type: String,
    enum: ['personal', 'commercial', 'extended'],
    default: 'personal'
  },

  // Status & moderation
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  madeByFlowbites: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rejectionReason: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,

  // Stats
  stats: {
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 }
  },

  // SEO
  metaDescription: String,
  keywords: [String],

  // Demo
  demoUrl: String,
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Indexes
templateSchema.index({ creatorId: 1, status: 1 });
templateSchema.index({ status: 1, madeByFlowbites: 1, createdAt: -1 });
templateSchema.index({ category: 1, status: 1 });
templateSchema.index({ status: 1, 'stats.purchases': -1 });
templateSchema.index({ platform: 1, status: 1 });
templateSchema.index({ title: 'text', description: 'text' });

// Generate slug before saving
templateSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await mongoose.model('Template').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

export const Template = mongoose.model('Template', templateSchema);
