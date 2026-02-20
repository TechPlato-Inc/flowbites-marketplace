import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  icon: String,
  color: String,
  templateCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

categorySchema.index({ order: 1 });

tagSchema.index({ usageCount: -1 });

export const Category = mongoose.model('Category', categorySchema);
export const Tag = mongoose.model('Tag', tagSchema);
