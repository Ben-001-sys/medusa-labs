import { z } from "@medusajs/framework/zod"

export const PostB2BPurchaseRequest = z.object({
  cart_id: z.string().min(1),

  purchase_order_number: z
    .string()
    .min(1)
    .max(120)
    .optional(),
})