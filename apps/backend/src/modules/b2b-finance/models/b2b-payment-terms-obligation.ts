import { model } from "@medusajs/framework/utils"

import { B2BPaymentTermsStatus } from "../types"

export const B2BPaymentTermsObligation = model
  .define("b2b_payment_terms_obligation", {
    id: model.id().primaryKey(),

    order_id: model.text().unique(),

    finance_review_id: model.text().index(),

    currency_code: model.text(),

    amount_due: model.bigNumber(),

    payment_terms_code: model.text(),

    due_at: model.dateTime().index(),

    status: model
      .enum(Object.values(B2BPaymentTermsStatus))
      .default(B2BPaymentTermsStatus.PENDING_INVOICE),

    external_invoice_id: model.text().unique().nullable(),

    external_ledger_reference: model.text().nullable(),

    opened_at: model.dateTime().nullable(),

    settled_at: model.dateTime().nullable(),
  })
  .indexes([
    {
      on: ["status", "due_at"],
    },
  ])