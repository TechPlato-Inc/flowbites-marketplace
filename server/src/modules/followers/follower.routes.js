import express from 'express';
import { FollowerController } from './follower.controller.js';
import { validate } from '../../middleware/validate.js';
import { followCreatorSchema, listFollowersQuerySchema } from './follower.validator.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const followerController = new FollowerController();

// Public
router.get(
  '/count/:creatorId',
  validate(followCreatorSchema),
  followerController.getFollowerCount
);

// Authenticated
router.get(
  '/following',
  authenticate,
  validate(listFollowersQuerySchema),
  followerController.getFollowing
);

router.get(
  '/check/:creatorId',
  authenticate,
  validate(followCreatorSchema),
  followerController.isFollowing
);

router.get(
  '/creator/:creatorId',
  authenticate,
  validate(followCreatorSchema),
  followerController.getFollowers
);

router.post(
  '/:creatorId',
  authenticate,
  validate(followCreatorSchema),
  followerController.follow
);

router.delete(
  '/:creatorId',
  authenticate,
  validate(followCreatorSchema),
  followerController.unfollow
);

export default router;
