import type { MedusaContainer } from "@medusajs/framework/types"

import { DELIVERY_SLOT_MODULE } from "../modules/delivery-slot"
import DeliverySlotModuleService from "../modules/delivery-slot/service"
import {
  DeliverySlotReservationStatus,
} from "../modules/delivery-slot/types"
import {
  expireDeliverySlotReservationWorkflow,
} from "../workflows/expire-delivery-slot"

export default async function expireDeliverySlotReservationsJob(
  container: MedusaContainer
) {
  const logger = container.resolve("logger")

  const deliverySlotService =
    container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE)

  const now = new Date()

  const candidates =
    await deliverySlotService.listDeliverySlotReservations({
      status: DeliverySlotReservationStatus.ACTIVE,
      expires_at: {
        $lte: now,
      },
    })

  let expiredCount = 0
  let skippedCount = 0
  let failedCount = 0

  for (const reservation of candidates) {
    try {
      const { result } =
        await expireDeliverySlotReservationWorkflow(container).run({
          input: {
            reservation_id: reservation.id,
            cart_id: reservation.cart_id,
            slot_id: reservation.slot_id,
          },
        })

      if (result.expired) {
        expiredCount += 1
      } else {
        skippedCount += 1
      }
    } catch (error) {
      failedCount += 1

      logger.error(
        `Failed to expire delivery reservation ${reservation.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  logger.info(
    `[delivery-slot-expiry] candidates=${candidates.length} ` +
      `expired=${expiredCount} skipped=${skippedCount} failed=${failedCount}`
  )
}

export const config = {
  name: "expire-delivery-slot-reservations",
  schedule: {
    interval: Number(
      process.env.DELIVERY_SLOT_EXPIRY_JOB_INTERVAL_MS ?? 300_000
    ),
  },
}