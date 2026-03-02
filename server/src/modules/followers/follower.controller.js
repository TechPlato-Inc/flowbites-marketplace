import { FollowerQueryService } from './follower.queryService.js';
import { FollowerWriteService } from './follower.writeService.js';

const queryService = new FollowerQueryService();
const writeService = new FollowerWriteService();

export class FollowerController {
  // POST /followers/:creatorId — follow
  async follow(req, res, next) {
    try {
      const data = await writeService.follow(req.user._id, req.params.creatorId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /followers/:creatorId — unfollow
  async unfollow(req, res, next) {
    try {
      const data = await writeService.unfollow(req.user._id, req.params.creatorId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/check/:creatorId — check if following
  async isFollowing(req, res, next) {
    try {
      const data = await queryService.isFollowing(req.user._id, req.params.creatorId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/following — get who I follow
  async getFollowing(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await queryService.getFollowing(req.user._id, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/creator/:creatorId — get followers of a creator
  async getFollowers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await queryService.getFollowers(req.params.creatorId, {
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /followers/count/:creatorId — public follower count
  async getFollowerCount(req, res, next) {
    try {
      const data = await queryService.getFollowerCount(req.params.creatorId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
