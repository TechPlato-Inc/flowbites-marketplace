import { FollowerQueryService } from './follower.queryService.js';
import { FollowerWriteService } from './follower.writeService.js';

// Backward-compatible facade — delegates to QueryService and WriteService.
// New code should import FollowerQueryService or FollowerWriteService directly.
export class FollowerService {
  constructor() {
    this._query = new FollowerQueryService();
    this._write = new FollowerWriteService();
  }

  isFollowing(followerId, creatorId) { return this._query.isFollowing(followerId, creatorId); }
  getFollowing(userId, opts) { return this._query.getFollowing(userId, opts); }
  getFollowers(creatorId, opts) { return this._query.getFollowers(creatorId, opts); }
  getFollowerCount(creatorId) { return this._query.getFollowerCount(creatorId); }
  follow(followerId, creatorId) { return this._write.follow(followerId, creatorId); }
  unfollow(followerId, creatorId) { return this._write.unfollow(followerId, creatorId); }
}
