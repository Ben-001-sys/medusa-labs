import { z } from "@medusajs/framework/zod"

export const PostSelectDeliverySlot = z.object({
  slot_id: z.string().min(1),
})