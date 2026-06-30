import type { ExecArgs } from "@medusajs/framework/types"

import { DELIVERY_SLOT_MODULE } from "../modules/delivery-slot"
import DeliverySlotModuleService from "../modules/delivery-slot/service"
import { DeliverySlotStatus } from "../modules/delivery-slot/types"

export default async function seedDeliverySlots({
  container,
}: ExecArgs) {
  const regionId = process.env.LAB_REGION_ID
  const stockLocationId = process.env.LAB_STOCK_LOCATION_ID

  if (!regionId) {
    throw new Error("LAB_REGION_ID is required.")
  }

  const deliverySlotService =
    container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE)

  const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  startAt.setHours(10, 0, 0, 0)

  const endAt = new Date(startAt.getTime() + 2 * 60 * 60 * 1000)

  const code = "accra-lab-slot-1"

  const existing = await deliverySlotService.listDeliverySlots({
    code,
  })

  if (existing.length > 0) {
    console.log(`Delivery slot already exists: ${code}`)
    return
  }

  const slot = await deliverySlotService.createDeliverySlots({
    code,
    region_id: regionId,
    stock_location_id: stockLocationId ?? null,
    start_at: startAt,
    end_at: endAt,
    capacity: 1,
    status: DeliverySlotStatus.ACTIVE,
  })

  console.log("Created delivery slot:")
  console.table([
    {
      id: slot.id,
      code: slot.code,
      region_id: slot.region_id,
      start_at: slot.start_at,
      end_at: slot.end_at,
      capacity: slot.capacity,
    },
  ])
}