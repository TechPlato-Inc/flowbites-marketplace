import { z } from "zod";

export const requestWithdrawalSchema = z.object({
  amount: z
    .number()
    .min(10, "Minimum withdrawal is $10")
    .max(100000, "Maximum withdrawal is $100,000"),
  payoutMethod: z
    .enum(["stripe_connect", "bank_transfer", "paypal"])
    .optional(),
  note: z.string().max(500, "Note too long").optional(),
});

export type RequestWithdrawalInput = z.infer<typeof requestWithdrawalSchema>;
