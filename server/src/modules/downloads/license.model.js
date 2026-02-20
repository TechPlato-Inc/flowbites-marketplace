import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const licenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    unique: true,
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  licenseType: {
    type: String,
    enum: ['personal', 'commercial', 'extended'],
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastDownloadedAt: Date
}, {
  timestamps: true
});

const downloadTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    required: true
  },
  licenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'License',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  },
  usedAt: Date,
  ipAddress: String
}, {
  timestamps: true
});

// Indexes
licenseSchema.index({ buyerId: 1, templateId: 1 });
licenseSchema.index({ orderId: 1 });

downloadTokenSchema.index({ expiresAt: 1 });
downloadTokenSchema.index({ used: 1, expiresAt: 1 });

// Generate license key
licenseSchema.pre('save', async function(next) {
  if (!this.licenseKey) {
    this.licenseKey = `FLW-${uuidv4().toUpperCase()}`;
  }
  next();
});

// Generate download token
downloadTokenSchema.pre('save', function(next) {
  if (!this.token) {
    this.token = uuidv4();
  }
  next();
});

export const License = mongoose.model('License', licenseSchema);
export const DownloadToken = mongoose.model('DownloadToken', downloadTokenSchema);
