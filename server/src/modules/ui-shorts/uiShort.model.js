import mongoose from 'mongoose';

const uiShotSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  image: {
    type: String,
    required: true
  },

  // Optional link to template
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },

  // Tags
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  // Stats
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    saves: { type: Number, default: 0 }
  },

  // Colors extracted from image (for filtering)
  colors: [String],

  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const shotLikeSchema = new mongoose.Schema({
  shotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UIShot',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const shotSaveSchema = new mongoose.Schema({
  shotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UIShot',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
uiShotSchema.index({ creatorId: 1, createdAt: -1 });
uiShotSchema.index({ templateId: 1 });
uiShotSchema.index({ 'stats.likes': -1 });
uiShotSchema.index({ createdAt: -1 });
uiShotSchema.index({ tags: 1 });

shotLikeSchema.index({ shotId: 1, userId: 1 }, { unique: true });
shotSaveSchema.index({ shotId: 1, userId: 1 }, { unique: true });

export const UIShot = mongoose.model('UIShot', uiShotSchema);
export const ShotLike = mongoose.model('ShotLike', shotLikeSchema);
export const ShotSave = mongoose.model('ShotSave', shotSaveSchema);
