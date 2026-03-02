import { Follower } from './follower.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class FollowerWriteService {
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

    // Fetch follower name so the notification listener payload is complete
    const followerUser = await User.findById(followerId).select('name').lean();
    const followerName = followerUser?.name || 'Someone';

    // Emit domain event — listener handles in-app notification
    eventBus.emit(EVENTS.CREATOR_FOLLOWED, {
      followerId: followerId.toString(),
      creatorId: creatorId.toString(),
      creatorUserId: creator.userId.toString(),
      followerName,
    });

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
}
