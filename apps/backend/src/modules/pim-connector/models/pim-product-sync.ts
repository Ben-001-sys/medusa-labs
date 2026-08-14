import { model } from "@medusajs/framework/utils"
import { PimProductSyncStatus } from "../types"

export const PimProductSync = model
  .define("pim_product_sync", {
    id: model.id().primaryKey(),

    source: model.text(),
    external_product_id: model.text(),

    medusa_product_id: model.text().index().nullable(),

    last_received_revision: model.number().default(0),
    last_applied_revision: model.number().default(0),

    last_payload_hash: model.text().nullable(),

    latest_payload: model.json(),

    status: model
      .enum(Object.values(PimProductSyncStatus))
      .default(PimProductSyncStatus.PENDING),

    last_received_at: model.dateTime().nullable(),
    last_applied_at: model.dateTime().nullable(),

    last_error_code: model.text().nullable(),
    last_error_message: model.text().nullable(),
  })
  .indexes([
    {
      on: ["source", "external_product_id"],
      unique: true,
    },
  ])