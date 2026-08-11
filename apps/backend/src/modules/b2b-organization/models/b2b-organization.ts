import { model } from "@medusajs/framework/utils"

import { B2BOrganizationMember } from "./b2b-organization-member"
import { B2BCartContext } from "./b2b-cart-context"
import { B2BOrganizationStatus } from "../types"

export const B2BOrganization = model
  .define("b2b_organization", {
    id: model.id().primaryKey(),

    legal_name: model.text(),

    display_name: model.text(),

    handle: model.text().unique(),

    status: model
      .enum(Object.values(B2BOrganizationStatus))
      .default(B2BOrganizationStatus.PENDING),

    // Existing Medusa IDs. These remain opaque strings.
    sales_channel_id: model.text().index(),

    // Optional negotiated-pricing customer group.
    customer_group_id: model.text().index().nullable(),

    default_region_id: model.text().index().nullable(),

    members: model.hasMany(() => B2BOrganizationMember, {
      mappedBy: "organization",
    }),

    cart_contexts: model.hasMany(() => B2BCartContext, {
      mappedBy: "organization",
    }),
  })
  .indexes([
    {
      on: ["sales_channel_id", "status"],
    },
  ])