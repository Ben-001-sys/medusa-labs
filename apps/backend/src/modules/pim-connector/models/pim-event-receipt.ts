import { model } from "@medusajs/framework/utils"
import { PimEventStatus } from "../types"

export const PimEventReceipt = model
  .define("pim_event_receipt", {
    id: model.id().primaryKey(),

    source: model.text(),
    event_id: model.text(),

    event_type: model.text(),

    external_product_id: model.text().index(),
    revision: model.number().index(),

    payload_hash: model.text(),

    status: model
      .enum(Object.values(PimEventStatus))
      .default(PimEventStatus.RECEIVED),

    attempt_count: model.number().default(0),

    received_at: model.dateTime().index(),
    processed_at: model.dateTime().nullable(),
    last_attempted_at: model.dateTime().nullable(),

    error_code: model.text().nullable(),
    error_message: model.text().nullable(),
  })
  .indexes([
    {
      on: ["source", "event_id"],
      unique: true,
    },
    {
      on: ["source", "external_product_id", "revision"],
    },
  ])