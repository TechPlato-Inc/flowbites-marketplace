import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

followerSchema.index({ followerId: 1, creatorId: 1 }, { unique: true });
followerSchema.index({ creatorId: 1, createdAt: -1 });
followerSchema.index({ followerId: 1, createdAt: -1 });

export const Follower = mongoose.model('Follower', followerSchema);
