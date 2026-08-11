import { defineLink } from "@medusajs/framework/utils";
import CartModule from "@medusajs/medusa/cart";

import B2BOrganizationModule, {
  B2B_ORGANIZATION_MODULE,
} from "../modules/b2b-organization";

export default defineLink(
  {
    linkable: {
      serviceName: B2B_ORGANIZATION_MODULE,
      entity: "b2b_cart_context",
    },
    field: "cart_id",
  },
  CartModule.linkable.cart,
  {
    readOnly: true,
  },
);
