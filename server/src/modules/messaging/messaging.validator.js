import { z } from 'zod';

export const createConversationSchema = z.object({
  body: z.object({
    recipientId: z.string().min(1, 'Recipient ID is required'),
    initialMessage: z.string().min(1, 'Message is required').max(5000, 'Message cannot exceed 5000 characters'),
    relatedTemplateId: z.string().optional(),
    relatedOrderId: z.string().optional(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(5000, 'Message cannot exceed 5000 characters'),
  }),
});

export const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
