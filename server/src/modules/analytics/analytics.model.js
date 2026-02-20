import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  anonymousId: String,

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Context
  page: {
    url: String,
    path: String,
    referrer: String
  },

  // Device/browser
  userAgent: String,
  ipAddress: String,

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ 'metadata.templateId': 1 });
analyticsEventSchema.index({ createdAt: -1 });

// TTL index to auto-delete old events (optional - keep 90 days)
analyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
