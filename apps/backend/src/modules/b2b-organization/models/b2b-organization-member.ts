import { model } from "@medusajs/framework/utils"

import { B2BOrganization } from "./b2b-organization"
import { B2BCartContext } from "./b2b-cart-context"

import {
  B2BOrganizationMemberStatus,
  B2BOrganizationRole,
} from "../types"

export const B2BOrganizationMember = model
  .define("b2b_organization_member", {
    id: model.id().primaryKey(),

    // Existing Medusa Customer ID.
    customer_id: model.text().index(),

    role: model
      .enum(Object.values(B2BOrganizationRole))
      .default(B2BOrganizationRole.BUYER),

    status: model
      .enum(Object.values(B2BOrganizationMemberStatus))
      .default(B2BOrganizationMemberStatus.INVITED),

    organization: model.belongsTo(() => B2BOrganization, {
      mappedBy: "members",
    }),

    cart_contexts: model.hasMany(() => B2BCartContext, {
      mappedBy: "member",
    }),
  })
  .indexes([
    {
      on: ["organization_id", "customer_id"],
      unique: true,
    },
    {
      on: ["customer_id", "status"],
    },
  ])