import { model } from "@medusajs/framework/utils"

import { B2BFinanceReviewStatus } from "../types"

export const B2BOrderFinanceReview = model
  .define("b2b_order_finance_review", {
    id: model.id().primaryKey(),

    order_id: model.text().unique(),

    purchase_request_id: model.text().unique().nullable(),

    organization_id: model.text().index(),

    finance_account_id: model.text().index().nullable(),

    currency_code: model.text(),

    order_total: model.bigNumber(),

    status: model
      .enum(Object.values(B2BFinanceReviewStatus))
      .default(B2BFinanceReviewStatus.PENDING),

    payment_terms_code: model.text().nullable(),

    external_credit_hold_id: model.text().index().nullable(),

    external_invoice_id: model.text().index().nullable(),

    decision_by_admin_user_id: model.text().index().nullable(),

    decision_reason_code: model.text().nullable(),

    decision_note: model.text().nullable(),

    decision_snapshot: model.json().nullable(),

    reviewed_at: model.dateTime().nullable(),

    valid_until: model.dateTime().index().nullable(),
  })
  .indexes([
    {
      on: ["organization_id", "status"],
    },
    {
      on: ["status", "valid_until"],
    },
  ])