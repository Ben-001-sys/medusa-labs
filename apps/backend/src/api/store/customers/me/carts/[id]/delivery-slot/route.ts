import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

import { reserveDeliverySlotWorkflow } from "../../../../../../../workflows/reserve-delivery-slot"
import { PostSelectDeliverySlot } from "./validators"

type PostSelectDeliverySlotBody = z.infer<typeof PostSelectDeliverySlot>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostSelectDeliverySlotBody>,
  res: MedusaResponse
) => {
  const { result } = await reserveDeliverySlotWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      customer_id: req.auth_context.actor_id,
      slot_id: req.validatedBody.slot_id,
    },
  })

  res.status(200).json(result)
}