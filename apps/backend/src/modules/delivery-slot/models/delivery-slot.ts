import { model } from "@medusajs/framework/utils"
import { DeliverySlotReservation } from "./delivery-slot-reservation"
import { DeliverySlotStatus } from "../types"

export const DeliverySlot = model.define("delivery_slot", {
  id: model.id().primaryKey(),

  code: model.text().unique(),

  region_id: model.text().index(),

  // Operational scope. In production, this points to the stock/fulfillment
  // location that can serve this slot.
  stock_location_id: model.text().nullable(),

  start_at: model.dateTime().index(),
  end_at: model.dateTime().index(),

  capacity: model.number(),

  status: model
    .enum(Object.values(DeliverySlotStatus))
    .default(DeliverySlotStatus.ACTIVE),

  reservations: model.hasMany(() => DeliverySlotReservation, {
    mappedBy: "slot",
  }),
})