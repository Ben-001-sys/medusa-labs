// apps/backend/src/modules/finance-connector/models/finance-sync-outbox.ts
import { model } from "@medusajs/framework/utils"

export enum FinanceSyncOutboxStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  ACCEPTED = "accepted",
  FAILED = "failed",
  MANUAL_REVIEW = "manual_review",
  CANCELLED = "cancelled",
}

export const FinanceSyncOutbox = model
  .define("finance_sync_outbox", {
    id: model.id().primaryKey(),

    operation: model.text().index(),

    aggregate_type: model.text().index(),
    aggregate_id: model.text().index(),

    organization_id: model.text().index().nullable(),

    idempotency_key: model.text().unique(),

    payload: model.json(),

    status: model
      .enum(Object.values(FinanceSyncOutboxStatus))
      .default(FinanceSyncOutboxStatus.PENDING),

    external_reference: model.text().index().nullable(),

    attempt_count: model.number().default(0),
    next_attempt_at: model.dateTime().index(),
    last_attempted_at: model.dateTime().nullable(),

    accepted_at: model.dateTime().nullable(),

    error_code: model.text().nullable(),
    error_message: model.text().nullable(),
  })
  .indexes([
    {
      on: ["status", "next_attempt_at"],
    },
  ])