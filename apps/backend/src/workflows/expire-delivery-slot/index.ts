import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import {
  expireDeliverySlotReservationStep,
} from "./steps/expire-delivery-slot-reservation"

type ExpireDeliverySlotReservationWorkflowInput = {
  reservation_id: string
  cart_id: string
  slot_id: string
}

export const expireDeliverySlotReservationWorkflow = createWorkflow(
  "expire-delivery-slot-reservation",
  (input: ExpireDeliverySlotReservationWorkflowInput) => {
    const cartLockKey = transform({ input }, ({ input }) => {
      return `cart:${input.cart_id}`
    })

    const slotLockKey = transform({ input }, ({ input }) => {
      return `delivery-slot:${input.slot_id}`
    })

    // acquireLockStep({
    //   key: cartLockKey,
    //   timeout: 2,
    //   ttl: 30,
    // })

    acquireLockStep({
      key: slotLockKey,
      timeout: 2,
      ttl: 30,
    })

    const result = expireDeliverySlotReservationStep({
      reservation_id: input.reservation_id,
    })

    releaseLockStep({
      key: slotLockKey,
    })

    // releaseLockStep({
    //   key: cartLockKey,
    // })

    return new WorkflowResponse(result)
  }
)