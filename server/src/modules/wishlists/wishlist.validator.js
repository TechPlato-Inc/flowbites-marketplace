import { z } from 'zod';

/**
 * POST /wishlists/:templateId  — body validation
 * Used via the route-level validate() middleware.
 */
export const addToWishlistSchema = z.object({
  body: z.object({
    templateId: z.string().min(1, 'templateId is required'),
  }),
});

/**
 * POST /wishlists/check-bulk  — body validation
 * Used via the route-level validate() middleware.
 */
export const bulkCheckSchema = z.object({
  body: z.object({
    templateIds: z
      .array(z.string().min(1))
      .min(1, 'At least one templateId is required')
      .max(100, 'Cannot check more than 100 templates at once'),
  }),
});

/**
 * GET /wishlists  — query-string validation
 * Used inline in the controller via safeParse.
 */
export const listWishlistQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
