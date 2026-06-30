import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import { DELIVERY_SLOT_MODULE } from "../../../modules/delivery-slot"
import DeliverySlotModuleService from "../../../modules/delivery-slot/service"
import {
  DeliverySlotReservationStatus,
  DeliverySlotStatus,
} from "../../../modules/delivery-slot/types"

export type ReserveDeliverySlotStepInput = {
  cart_id: string
  customer_id: string
  slot_id: string
}

export const reserveDeliverySlotStep = createStep(
  "reserve-delivery-slot",
  async (
    { cart_id, customer_id, slot_id }: ReserveDeliverySlotStepInput,
    { container }
  ) => {
    const cartModuleService = container.resolve(Modules.CART)
    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE)

    const cart = await cartModuleService.retrieveCart(cart_id)

    if (cart.customer_id !== customer_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This cart does not belong to the authenticated customer."
      )
    }

    const existingReservations =
      await deliverySlotService.listDeliverySlotReservations({
        cart_id,
        status: DeliverySlotReservationStatus.ACTIVE,
      })

    // Idempotency: same request repeated for the same slot is safe.
    if (existingReservations.length > 0) {
      const existingReservation = existingReservations[0]

      if (existingReservation.slot_id === slot_id) {
        return new StepResponse({
          reservation: existingReservation,
          already_reserved: true,
        })
      }

      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This cart already has an active delivery-slot reservation."
      )
    }

    const slot = await deliverySlotService.retrieveDeliverySlot(slot_id)

    if (slot.status !== DeliverySlotStatus.ACTIVE) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This delivery slot is unavailable."
      )
    }

    if (slot.region_id !== cart.region_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This delivery slot is not available for the cart's region."
      )
    }

    const now = new Date()

    if (new Date(slot.start_at) <= now) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This delivery slot has already started."
      )
    }

    const activeReservations =
      await deliverySlotService.listDeliverySlotReservations({
        slot_id,
        status: DeliverySlotReservationStatus.ACTIVE,
      })

    if (activeReservations.length >= slot.capacity) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This delivery slot is fully booked."
      )
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    const reservation =
      await deliverySlotService.createDeliverySlotReservations({
        cart_id,
        customer_id,
        slot_id,
        status: DeliverySlotReservationStatus.ACTIVE,
        expires_at: expiresAt,
      })

    return new StepResponse(
      {
        reservation,
        already_reserved: false,
      },
      {
        reservation_id: reservation.id,
      }
    )
  },

  async (compensationData, { container }) => {
    if (!compensationData?.reservation_id) {
      return
    }

    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE)

    await deliverySlotService.deleteDeliverySlotReservations(
      compensationData.reservation_id
    )
  }
)