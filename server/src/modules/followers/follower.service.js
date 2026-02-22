import { Follower } from './follower.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';

const notificationService = new NotificationService();

export class FollowerService {
  /**
   * Follow a creator.
   */
  async follow(followerId, creatorId) {
    if (followerId.toString() === creatorId.toString()) {
      throw new AppError('You cannot follow yourself', 400);
    }

    const creator = await CreatorProfile.findOne({ userId: creatorId });
    if (!creator) throw new AppError('Creator not found', 404);

    const existing = await Follower.findOne({ followerId, creatorId });
    if (existing) throw new AppError('Already following this creator', 400);

    const follow = await Follower.create({ followerId, creatorId });

    // Update creator follower count
    await CreatorProfile.findOneAndUpdate(
      { userId: creatorId },
      { $inc: { 'stats.followers': 1 } }
    );

    // Notify creator (non-blocking)
    User.findById(followerId).then(follower => {
      const name = follower?.name || 'Someone';
      notificationService.notifyNewFollower(creatorId, name).catch(() => {});
    }).catch(() => {});

    return follow;
  }

  /**
   * Unfollow a creator.
   */
  async unfollow(followerId, creatorId) {
    const follow = await Follower.findOneAndDelete({ followerId, creatorId });
    if (!follow) throw new AppError('Not following this creator', 400);

    await CreatorProfile.findOneAndUpdate(
      { userId: creatorId },
      { $inc: { 'stats.followers': -1 } }
    );

    return { unfollowed: true };
  }

  /**
   * Check if following a creator.
   */
  async isFollowing(followerId, creatorId) {
    const follow = await Follower.findOne({ followerId, creatorId });
    return { following: !!follow };
  }

  /**
   * Get creators a user follows.
   */
  async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      Follower.find({ followerId: userId })
        .populate({
          path: 'creatorId',
          select: 'name avatar',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Follower.countDocuments({ followerId: userId }),
    ]);

    // Enrich with creator profiles
    const creatorUserIds = follows.map(f => f.creatorId?._id || f.creatorId);
    const profiles = await CreatorProfile.find({ userId: { $in: creatorUserIds } })
      .select('displayName username avatar stats isVerified')
      .lean();

    const enriched = follows.map(f => {
      const uid = f.creatorId?._id?.toString() || f.creatorId?.toString();
      const profile = profiles.find(p => p.userId.toString() === uid);
      return { ...f, creatorProfile: profile || null };
    });

    return {
      following: enriched,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get followers of a creator.
   */
  async getFollowers(creatorId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      Follower.find({ creatorId })
        .populate('followerId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Follower.countDocuments({ creatorId }),
    ]);

    return {
      followers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get follower count for a creator.
   */
  async getFollowerCount(creatorId) {
    const count = await Follower.countDocuments({ creatorId });
    return { count };
  }
}
