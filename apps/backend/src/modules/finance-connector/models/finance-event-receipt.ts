// apps/backend/src/modules/finance-connector/models/finance-event-receipt.ts
import { model } from "@medusajs/framework/utils"

export const FinanceEventReceipt = model
  .define("finance_event_receipt", {
    id: model.id().primaryKey(),

    source: model.text(),
    event_id: model.text(),

    event_type: model.text().index(),

    payload_hash: model.text(),

    subject_type: model.text().nullable(),
    subject_id: model.text().index().nullable(),

    occurred_at: model.dateTime().index(),
    received_at: model.dateTime().index(),
    processed_at: model.dateTime().nullable(),

    processing_status: model.text().index(),

    error_code: model.text().nullable(),
    error_message: model.text().nullable(),
  })
  .indexes([
    {
      on: ["source", "event_id"],
      unique: true,
    },
  ])