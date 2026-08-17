import { z } from "@medusajs/framework/zod"

export const PostFinanceDecision = z.object({
  decision: z.enum([
    "approved_on_account",
    "prepayment_required",
    "rejected",
  ]),

  reason_code: z.string().max(100).optional(),

  note: z.string().max(2000).optional(),
})