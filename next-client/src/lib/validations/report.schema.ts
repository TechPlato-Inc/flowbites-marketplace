import { z } from "zod";

export const createReportSchema = z.object({
  targetType: z.enum(["template", "review", "creator", "user"]),
  targetId: z.string().min(1, "Target is required"),
  reason: z.enum([
    "spam",
    "inappropriate_content",
    "copyright_violation",
    "fake_review",
    "misleading",
    "offensive",
    "scam",
  ]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description too long"),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
