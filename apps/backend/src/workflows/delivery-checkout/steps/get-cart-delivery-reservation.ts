import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  MedusaError,
} from "@medusajs/framework/utils"

import { DELIVERY_SLOT_MODULE } from "../../../modules/delivery-slot"
import DeliverySlotModuleService from "../../../modules/delivery-slot/service"
import {
  DeliverySlotReservationStatus,
} from "../../../modules/delivery-slot/types"

type Input = {
  cart_id: string
}

type GetCartDeliveryReservationStepOutput = {
  reservation_id: string
  slot_id: string
}

export const getCartDeliveryReservationStep = createStep<
  Input,
  GetCartDeliveryReservationStepOutput,
  never
>(
  "get-cart-delivery-reservation",
  async ({ cart_id }: Input, { container }) => {
    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(
        DELIVERY_SLOT_MODULE
      )

    const reservations =
      await deliverySlotService.listDeliverySlotReservations({
        cart_id,
      })

    const reservation = reservations.find(
      (item) =>
        item.status ===
          DeliverySlotReservationStatus.ACTIVE ||
        item.status ===
          DeliverySlotReservationStatus.CHECKOUT_PENDING ||
        item.status ===
          DeliverySlotReservationStatus.CONFIRMED
    )

    if (!reservation) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A valid delivery reservation is required."
      )
    }

    return new StepResponse({
      reservation_id: reservation.id,
      slot_id: reservation.slot_id,
    })
  }
)