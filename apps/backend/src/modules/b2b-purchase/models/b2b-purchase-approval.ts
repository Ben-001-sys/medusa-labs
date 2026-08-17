import { model } from "@medusajs/framework/utils"

import {
  B2BPurchaseRequest,
} from "./b2b-purchase-request"

import {
  B2BPurchaseApprovalDecision,
} from "../types"

export const B2BPurchaseApproval = model
  .define("b2b_purchase_approval", {
    id: model.id().primaryKey(),

    approver_member_id: model.text().index(),

    decision: model.enum(
      Object.values(B2BPurchaseApprovalDecision)
    ),

    note: model.text().nullable(),

    decided_at: model.dateTime().index(),

    purchase_request: model.belongsTo(
      () => B2BPurchaseRequest,
      {
        mappedBy: "approvals",
      }
    ),
  })
  .indexes([
    {
      on: ["purchase_request_id", "approver_member_id"],
      unique: true,
    },
  ])