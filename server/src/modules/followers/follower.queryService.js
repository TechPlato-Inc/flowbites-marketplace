import { Follower } from './follower.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { toFollowerDTO, toFollowingDTO } from './dto/follower.dto.js';

export class FollowerQueryService {
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
      following: enriched.map(toFollowingDTO),
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
      followers: followers.map(toFollowerDTO),
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
