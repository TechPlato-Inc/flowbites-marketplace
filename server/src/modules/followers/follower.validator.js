import { z } from 'zod';

/**
 * Validate params for follow / unfollow / check / get-followers routes.
 * Expects `params.creatorId` to be a non-empty string (Mongo ObjectId).
 */
export const followCreatorSchema = z.object({
  params: z.object({
    creatorId: z.string().min(1, 'creatorId is required'),
  }),
});

/**
 * Validate query params for paginated list endpoints
 * (getFollowing, getFollowers).
 */
export const listFollowersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  }),
});
