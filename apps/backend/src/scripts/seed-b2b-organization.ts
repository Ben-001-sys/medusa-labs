import type { ExecArgs } from "@medusajs/framework/types"

import {
  B2B_ORGANIZATION_MODULE,
} from "../modules/b2b-organization"

import B2BOrganizationModuleService from
  "../modules/b2b-organization/service"

import {
  B2BOrganizationMemberStatus,
  B2BOrganizationRole,
  B2BOrganizationStatus,
} from "../modules/b2b-organization/types"

export default async function seedB2BOrganization({
  container,
}: ExecArgs) {
  const salesChannelId =
    process.env.LAB_B2B_SALES_CHANNEL_ID

  const customerGroupId =
    process.env.LAB_B2B_CUSTOMER_GROUP_ID

  const customerId =
    process.env.LAB_B2B_CUSTOMER_ID

  if (!salesChannelId || !customerId) {
    throw new Error(
      "LAB_B2B_SALES_CHANNEL_ID and LAB_B2B_CUSTOMER_ID are required."
    )
  }

  const service =
    container.resolve<B2BOrganizationModuleService>(
      B2B_ORGANIZATION_MODULE
    )

  const handle = "acme-procurement"

  const organizations =
    await service.listB2BOrganizations({ handle })

  const organization =
    organizations[0] ??
    (await service.createB2BOrganizations({
      legal_name: "Acme Procurement Limited",
      display_name: "Acme Procurement",
      handle,
      status: B2BOrganizationStatus.ACTIVE,
      sales_channel_id: salesChannelId,
      customer_group_id: customerGroupId ?? null,
    }))

  const members =
    await service.listB2BOrganizationMembers({
      organization_id: organization.id,
      customer_id: customerId,
    })

  const member =
    members[0] ??
    (await service.createB2BOrganizationMembers({
      organization_id: organization.id,
      customer_id: customerId,
      role: B2BOrganizationRole.OWNER,
      status: B2BOrganizationMemberStatus.ACTIVE,
    }))

  console.table([
    {
      organization_id: organization.id,
      organization: organization.display_name,
      member_id: member.id,
      customer_id: member.customer_id,
      role: member.role,
    },
  ])
}