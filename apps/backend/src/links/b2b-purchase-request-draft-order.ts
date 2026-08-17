import { defineLink } from "@medusajs/framework/utils";
import OrderModule from "@medusajs/medusa/order";

import B2BPurchaseModule from "../modules/b2b-purchase";

const b2bLinkable: any = (B2BPurchaseModule.linkable as any).b2bPurchaseRequest;

export default defineLink(
  { linkable: b2bLinkable, field: "draft_order_id" },
  { linkable: OrderModule.linkable.order, alias: "draft_order" },
  { readOnly: true },
);
