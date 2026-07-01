import { model } from "@medusajs/framework/utils"
import { DeliverySlot } from "./delivery-slot"
import { DeliverySlotReservationStatus } from "../types"

export const DeliverySlotReservation = model
  .define("delivery_slot_reservation", {
    id: model.id().primaryKey(),

    // External Medusa record IDs are stored as opaque text IDs.
    // We do not add a foreign key to Medusa's Cart table.
    cart_id: model.text().index(),

    customer_id: model.text().index(),

    status: model
      .enum(Object.values(DeliverySlotReservationStatus))
      .default(DeliverySlotReservationStatus.ACTIVE),

    expires_at: model.dateTime().index(),

    expired_at: model.dateTime().index().nullable(),

    slot: model.belongsTo(() => DeliverySlot, {
      mappedBy: "reservations",
    }),
  })
  .indexes([
    {
      on: ["slot_id", "status"],
    },
    {
      on: ["cart_id", "status"],
    },
  ])