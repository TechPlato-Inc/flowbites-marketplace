import express from 'express';
import { FollowerController } from './follower.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const followerController = new FollowerController();

// Public
router.get('/count/:creatorId', followerController.getFollowerCount);

// Authenticated
router.get('/following', authenticate, followerController.getFollowing);
router.get('/check/:creatorId', authenticate, followerController.isFollowing);
router.get('/creator/:creatorId', authenticate, followerController.getFollowers);
router.post('/:creatorId', authenticate, followerController.follow);
router.delete('/:creatorId', authenticate, followerController.unfollow);

export default router;
