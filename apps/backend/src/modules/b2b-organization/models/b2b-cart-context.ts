import { model } from "@medusajs/framework/utils"

import { B2BOrganization } from "./b2b-organization"
import { B2BOrganizationMember } from "./b2b-organization-member"

export const B2BCartContext = model
  .define("b2b_cart_context", {
    id: model.id().primaryKey(),

    // Existing Medusa Cart and Customer IDs.
    cart_id: model.text().unique(),

    customer_id: model.text().index(),

    organization: model.belongsTo(() => B2BOrganization, {
      mappedBy: "cart_contexts",
    }),

    member: model.belongsTo(() => B2BOrganizationMember, {
      mappedBy: "cart_contexts",
    }),
  })
  .indexes([
    {
      on: ["organization_id", "customer_id"],
    },
  ])