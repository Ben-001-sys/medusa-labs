import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

import { DELIVERY_SLOT_MODULE } from "../../../modules/delivery-slot"
import DeliverySlotModuleService from "../../../modules/delivery-slot/service"
import {
  DeliverySlotReservationStatus,
  DeliverySlotStatus,
} from "../../../modules/delivery-slot/types"

type Input = {
  cart_id: string
  reservation_id: string
}

type ClaimDeliverySlotForCheckoutStepOutput = {
  reservation: Awaited<ReturnType<DeliverySlotModuleService["retrieveDeliverySlotReservation"]>>
  already_confirmed: boolean
}

type ClaimDeliverySlotForCheckoutStepCompensationInput = {
  reservation_id: string
}

export const claimDeliverySlotForCheckoutStep = createStep<
  Input,
  ClaimDeliverySlotForCheckoutStepOutput,
  ClaimDeliverySlotForCheckoutStepCompensationInput
>(
  "claim-delivery-slot-for-checkout",
  async ({ cart_id, reservation_id }: Input, { container }) => {
    const cartModuleService = container.resolve(Modules.CART)

    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(
        DELIVERY_SLOT_MODULE
      )

    const cart = await cartModuleService.retrieveCart(cart_id)

    const reservation =
      await deliverySlotService.retrieveDeliverySlotReservation(
        reservation_id
      )

    if (reservation.cart_id !== cart.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Delivery reservation does not belong to this cart."
      )
    }

    if (
      reservation.status ===
      DeliverySlotReservationStatus.CONFIRMED
    ) {
      return new StepResponse({
        reservation,
        already_confirmed: true,
      })
    }

    if (
      reservation.status !==
      DeliverySlotReservationStatus.ACTIVE
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Delivery reservation is unavailable."
      )
    }

    if (new Date(reservation.expires_at) <= new Date()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Delivery reservation has expired."
      )
    }

    const slot =
      await deliverySlotService.retrieveDeliverySlot(
        reservation.slot_id
      )

    if (slot.status !== DeliverySlotStatus.ACTIVE) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Delivery slot is unavailable."
      )
    }

    if (slot.region_id !== cart.region_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Delivery slot is unavailable for this market."
      )
    }

    const now = new Date()

    const checkoutExpiresAt = new Date(
      now.getTime() + 5 * 60 * 1000
    )

    const updated =
      await deliverySlotService.updateDeliverySlotReservations({
        id: reservation.id,
        status:
          DeliverySlotReservationStatus.CHECKOUT_PENDING,
        checkout_started_at: now,
        checkout_expires_at: checkoutExpiresAt,
      })

    return new StepResponse(
      {
        reservation: updated,
        already_confirmed: false,
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
      container.resolve<DeliverySlotModuleService>(
        DELIVERY_SLOT_MODULE
      )

    await deliverySlotService.updateDeliverySlotReservations({
      id: compensationData.reservation_id,
      status: DeliverySlotReservationStatus.ACTIVE,
      checkout_started_at: null,
      checkout_expires_at: null,
    })
  }
)