import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import { DELIVERY_SLOT_MODULE } from "../../../modules/delivery-slot"
import DeliverySlotModuleService from "../../../modules/delivery-slot/service"
import {
  DeliverySlotReservationStatus,
} from "../../../modules/delivery-slot/types"

export type ExpireDeliverySlotReservationStepInput = {
  reservation_id: string
}

export const expireDeliverySlotReservationStep = createStep(
  "expire-delivery-slot-reservation",
  async ({ reservation_id }: ExpireDeliverySlotReservationStepInput, {
    container,
  }) => {
    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE)

    const reservations =
      await deliverySlotService.listDeliverySlotReservations({
        id: reservation_id,
      })

    const reservation = reservations[0]

    // The reservation may have been removed or changed after the job found it.
    if (!reservation) {
      return new StepResponse({
        reservation_id,
        expired: false,
        reason: "not_found",
      })
    }

    if (reservation.status !== DeliverySlotReservationStatus.ACTIVE) {
      return new StepResponse({
        reservation_id,
        expired: false,
        reason: "not_active",
      })
    }

    const now = new Date()

    if (new Date(reservation.expires_at) > now) {
      return new StepResponse({
        reservation_id,
        expired: false,
        reason: "not_yet_expired",
      })
    }

    const updatedReservation =
      await deliverySlotService.updateDeliverySlotReservations({
        id: reservation.id,
        status: DeliverySlotReservationStatus.EXPIRED,
        expired_at: now,
      })

    return new StepResponse(
      {
        reservation: updatedReservation,
        expired: true,
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

    // In this lab, compensation restores the hold only if a later workflow
    // step fails before the workflow completes.
    await deliverySlotService.updateDeliverySlotReservations({
      id: compensationData.reservation_id,
      status: DeliverySlotReservationStatus.ACTIVE,
      expired_at: null,
    })
  }
)