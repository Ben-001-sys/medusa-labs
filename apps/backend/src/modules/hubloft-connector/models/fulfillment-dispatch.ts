import { model } from "@medusajs/framework/utils"

export enum FulfillmentDispatchStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  FAILED = "failed",
  MANUAL_REVIEW = "manual_review",
  CANCELLED = "cancelled",
}

export const FulfillmentDispatch = model
  .define("hubloft_fulfillment_dispatch", {
    id: model.id().primaryKey(),

    order_id: model.text().index(),

    delivery_reservation_id: model.text().index(),

    idempotency_key: model.text().unique(),

    status: model
      .enum(Object.values(FulfillmentDispatchStatus))
      .default(FulfillmentDispatchStatus.PENDING),

    external_request_id: model.text().index().nullable(),

    attempt_count: model.number().default(0),

    not_before_at: model.dateTime().index(),

    last_attempted_at: model.dateTime().nullable(),

    accepted_at: model.dateTime().nullable(),

    error_code: model.text().nullable(),

    error_message: model.text().nullable(),
  })
  .indexes([
    {
      on: ["status", "not_before_at"],
    },
  ])