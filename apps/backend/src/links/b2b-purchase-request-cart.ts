import { defineLink } from "@medusajs/framework/utils";
import CartModule from "@medusajs/medusa/cart";

import B2BPurchaseModule from "../modules/b2b-purchase";

const b2bLinkable: any = (B2BPurchaseModule.linkable as any).b2bPurchaseRequest;

export default defineLink(
  { linkable: b2bLinkable, field: "cart_id" },
  CartModule.linkable.cart,
  { readOnly: true },
);
