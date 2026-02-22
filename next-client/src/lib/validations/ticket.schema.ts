import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject too long"),
  category: z.enum([
    "billing",
    "technical",
    "account",
    "template",
    "refund",
    "other",
  ]),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message too long"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const ticketReplySchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message too long"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
