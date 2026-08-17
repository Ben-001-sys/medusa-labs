import { model } from "@medusajs/framework/utils"

import { B2BFinanceOperatorRole } from "../types"

export const B2BFinanceOperator = model
  .define("b2b_finance_operator", {
    id: model.id().primaryKey(),

    admin_user_id: model.text().unique(),

    role: model.enum(
      Object.values(B2BFinanceOperatorRole)
    ),

    active: model.boolean().default(true),
  })
  .indexes([
    {
      on: ["active", "role"],
    },
  ])