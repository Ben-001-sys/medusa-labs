import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  completeCartWithDeliverySlotWorkflow,
} from "../../../../../workflows/delivery-checkout/complete-cart-with-delivery-slot"

export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { result } =
    await completeCartWithDeliverySlotWorkflow(
      req.scope
    ).run({
      input: {
        cart_id: req.params.id,
      },
    })

  res.status(200).json({
    type: "order",
    order: {
      id: result.order_id,
    },
    delivery_reservation: result.delivery_reservation,
  })
}