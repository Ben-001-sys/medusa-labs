import { model } from "@medusajs/framework/utils"

import { B2BFinanceAccountStatus } from "../types"

export const B2BFinanceAccount = model
  .define("b2b_finance_account", {
    id: model.id().primaryKey(),

    organization_id: model.text().index(),

    currency_code: model.text(),

    status: model
      .enum(Object.values(B2BFinanceAccountStatus))
      .default(B2BFinanceAccountStatus.PENDING),

    payment_terms_code: model.text().nullable(),

    // Informational policy snapshot only.
    // Do not treat as the live AR ledger.
    approved_credit_limit: model.bigNumber().nullable(),

    credit_reviewed_at: model.dateTime().nullable(),

    credit_valid_until: model.dateTime().nullable(),

    requires_manual_review: model.boolean().default(true),

    external_finance_account_id: model.text().nullable(),

    finance_source: model.text().nullable(),
  })
  .indexes([
    {
      on: ["organization_id", "currency_code"],
      unique: true,
    },
    {
      on: ["status", "credit_valid_until"],
    },
  ])