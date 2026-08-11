import { defineLink } from "@medusajs/framework/utils";
import CustomerModule from "@medusajs/medusa/customer";

import B2BOrganizationModule, {
  B2B_ORGANIZATION_MODULE,
} from "../modules/b2b-organization";

export default defineLink(
  {
    linkable: {
      serviceName: B2B_ORGANIZATION_MODULE,
      entity: "b2b_organization_member",
    },
    field: "customer_id",
  },
  CustomerModule.linkable.customer,
  {
    readOnly: true,
  },
);
