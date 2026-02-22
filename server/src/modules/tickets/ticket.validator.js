import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject cannot exceed 200 characters'),
    category: z.enum(['billing', 'technical', 'account', 'template', 'refund', 'other']),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message cannot exceed 2000 characters'),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),
});

export const ticketReplySchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(2000, 'Message cannot exceed 2000 characters'),
  }),
});

export const assignTicketSchema = z.object({
  body: z.object({
    assignToId: z.string().min(1, 'Assignee ID is required'),
  }),
});
