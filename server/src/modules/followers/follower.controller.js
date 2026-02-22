import { FollowerService } from './follower.service.js';

const followerService = new FollowerService();

export class FollowerController {
  // POST /followers/:creatorId — follow
  async follow(req, res, next) {
    try {
      const data = await followerService.follow(req.user._id, req.params.creatorId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /followers/:creatorId — unfollow
  async unfollow(req, res, next) {
    try {
      const data = await followerService.unfollow(req.user._id, req.params.creatorId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/check/:creatorId — check if following
  async isFollowing(req, res, next) {
    try {
      const data = await followerService.isFollowing(req.user._id, req.params.creatorId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/following — get who I follow
  async getFollowing(req, res, next) {
    try {
      const data = await followerService.getFollowing(req.user._id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/creator/:creatorId — get followers of a creator
  async getFollowers(req, res, next) {
    try {
      const data = await followerService.getFollowers(req.params.creatorId, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/count/:creatorId — public follower count
  async getFollowerCount(req, res, next) {
    try {
      const data = await followerService.getFollowerCount(req.params.creatorId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
