import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
}, {
  timestamps: true,
});

wishlistSchema.index({ userId: 1, templateId: 1 }, { unique: true });
wishlistSchema.index({ userId: 1, createdAt: -1 });
wishlistSchema.index({ templateId: 1 });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
