import { model } from "@medusajs/framework/utils"

import { B2BOrderReleaseStatus } from "../types"

export const B2BOrderRelease = model
  .define("b2b_order_release", {
    id: model.id().primaryKey(),

    order_id: model.text().unique(),

    finance_review_id: model.text().index(),

    status: model
      .enum(Object.values(B2BOrderReleaseStatus))
      .default(B2BOrderReleaseStatus.FINANCE_PENDING),

    release_idempotency_key: model.text().unique(),

    released_by_admin_user_id: model.text().nullable(),

    released_at: model.dateTime().nullable(),

    blocked_at: model.dateTime().nullable(),

    blocked_reason_code: model.text().nullable(),

    blocked_reason_note: model.text().nullable(),
  })
  .indexes([
    {
      on: ["status"],
    },
  ])