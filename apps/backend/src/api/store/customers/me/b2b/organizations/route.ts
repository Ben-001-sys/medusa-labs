import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { B2B_ORGANIZATION_MODULE } from "../../../../../../modules/b2b-organization";

import B2BOrganizationModuleService from "../../../../../../modules/b2b-organization/service";

import {
  B2BOrganizationMemberStatus,
  B2BOrganizationStatus,
} from "../../../../../../modules/b2b-organization/types";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const service = req.scope.resolve<B2BOrganizationModuleService>(
    B2B_ORGANIZATION_MODULE,
  );

  const customerId = req.auth_context.actor_id;

  if (!customerId) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug(
        "/store/customers/me/b2b/organizations - missing auth_context.actor_id",
        {
          auth_context:
            req.auth_context && typeof req.auth_context === "object"
              ? { actor_id: (req.auth_context as any).actor_id }
              : req.auth_context,
        },
      );
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  const memberships = await service.listB2BOrganizationMembers({
    customer_id: customerId,
    status: B2BOrganizationMemberStatus.ACTIVE,
  });

  const organizationIds = memberships.map(
    (membership) => membership.organization_id,
  );

  if (organizationIds.length === 0) {
    return res.json({
      organizations: [],
    });
  }

  const organizations = await service.listB2BOrganizations({
    id: organizationIds,
    status: B2BOrganizationStatus.ACTIVE,
  });

  const roleByOrganization = new Map(
    memberships.map((membership) => [
      membership.organization_id,
      membership.role,
    ]),
  );

  return res.json({
    organizations: organizations.map((organization) => ({
      id: organization.id,
      display_name: organization.display_name,
      handle: organization.handle,
      sales_channel_id: organization.sales_channel_id,
      role: roleByOrganization.get(organization.id),
    })),
  });
};
