import { MedusaError } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"

import { DELIVERY_SLOT_MODULE } from "../../modules/delivery-slot"
import DeliverySlotModuleService from "../../modules/delivery-slot/service"
import {
  DeliverySlotReservationStatus,
} from "../../modules/delivery-slot/types"

completeCartWorkflow.hooks.validate(
  async ({ cart }, { container }) => {
    const metadata =
      (cart.metadata as Record<string, unknown> | undefined) ?? {}

    // In production, set this server-side when a delivery-slot-required
    // shipping method is selected. Do not trust browser metadata.
    if (metadata.delivery_slot_required !== true) {
      return
    }

    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(
        DELIVERY_SLOT_MODULE
      )

    const reservations =
      await deliverySlotService.listDeliverySlotReservations({
        cart_id: cart.id,
      })

    const now = new Date()

    const checkoutIsAuthorized = reservations.some(
      (reservation) =>
        reservation.status ===
          DeliverySlotReservationStatus.CONFIRMED ||
        (
          reservation.status ===
            DeliverySlotReservationStatus.CHECKOUT_PENDING &&
          reservation.checkout_expires_at &&
          new Date(reservation.checkout_expires_at) > now
        )
    )

    if (!checkoutIsAuthorized) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Select and reserve a valid delivery slot before checkout."
      )
    }
  }
)