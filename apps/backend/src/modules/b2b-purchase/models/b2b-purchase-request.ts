import { model } from "@medusajs/framework/utils"

import {
  B2BPurchaseApproval,
} from "./b2b-purchase-approval"

import {
  B2BPurchaseRequestStatus,
} from "../types"

export const B2BPurchaseRequest = model
  .define("b2b_purchase_request", {
    id: model.id().primaryKey(),

    reference: model.text().unique(),

    organization_id: model.text().index(),
    requester_member_id: model.text().index(),
    customer_id: model.text().index(),

    // Original cart, retained for traceability only.
    cart_id: model.text().index(),

    // Medusa commercial snapshot and later converted order.
    draft_order_id: model.text().unique().nullable(),
    order_change_id: model.text().unique().nullable(),
    order_id: model.text().unique().nullable(),

    status: model
      .enum(Object.values(B2BPurchaseRequestStatus))
      .default(
        B2BPurchaseRequestStatus.PENDING_INTERNAL_APPROVAL
      ),

    currency_code: model.text(),

    requested_total: model.bigNumber(),

    purchase_order_number: model.text().nullable(),

    // Immutable snapshot of the cart at submission time.
    cart_snapshot: model.json(),

    // Snapshot prevents later policy edits from rewriting history.
    policy_snapshot: model.json(),

    submitted_at: model.dateTime().index(),
    expires_at: model.dateTime().unique().nullable(),

    approved_at: model.dateTime().nullable(),
    quoted_at: model.dateTime().nullable(),
    accepted_at: model.dateTime().nullable(),
    rejected_at: model.dateTime().nullable(),
    cancelled_at: model.dateTime().nullable(),

    approvals: model.hasMany(() => B2BPurchaseApproval, {
      mappedBy: "purchase_request",
    }),
  })
  .indexes([
    {
      on: ["organization_id", "status"],
    },
    {
      on: ["customer_id", "status"],
    },
    {
      on: ["status", "expires_at"],
    },
  ])