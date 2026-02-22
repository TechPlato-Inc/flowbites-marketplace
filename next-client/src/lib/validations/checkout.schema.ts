import { z } from "zod";

export const templateCheckoutSchema = z.object({
  items: z
    .array(
      z.object({ templateId: z.string().min(1, "Template ID is required") }),
    )
    .min(1, "At least one item is required")
    .max(10, "Maximum 10 items per checkout"),
  couponCode: z.string().optional(),
});

export const serviceCheckoutSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters")
    .max(5000, "Requirements too long")
    .optional(),
});

export type TemplateCheckoutInput = z.infer<typeof templateCheckoutSchema>;
export type ServiceCheckoutInput = z.infer<typeof serviceCheckoutSchema>;
