import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject cannot exceed 200 characters'),
    category: z.enum(['billing', 'technical', 'account', 'template', 'refund', 'other']),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message cannot exceed 5000 characters'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  }),
});

export const replyTicketSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(5000, 'Message cannot exceed 5000 characters'),
  }),
});

export const updateTicketStatusSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'in_progress', 'waiting_on_user', 'resolved', 'closed']),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    status: z.enum(['open', 'in_progress', 'waiting_on_user', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    category: z.enum(['billing', 'technical', 'account', 'template', 'refund', 'other']).optional(),
  }),
});

export const assignTicketSchema = z.object({
  body: z.object({
    assignToId: z.string().min(1, 'Assignee ID is required'),
  }),
});
