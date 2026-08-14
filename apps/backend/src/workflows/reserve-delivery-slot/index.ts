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
  reserveDeliverySlotStep,
  type ReserveDeliverySlotStepInput,
} from "./steps/reserve-delivery-slot"

export const reserveDeliverySlotWorkflow = createWorkflow(
  "reserve-delivery-slot",
  (input: ReserveDeliverySlotStepInput) => {
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

    const result = reserveDeliverySlotStep(input)

    releaseLockStep({
      key: slotLockKey,
    })

    // releaseLockStep({
    //   key: cartLockKey,
    // })

    return new WorkflowResponse(result)
  }
)