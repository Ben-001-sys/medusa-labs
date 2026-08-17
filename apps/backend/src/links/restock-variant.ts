import { defineLink } from "@medusajs/framework/utils";
import RestockModule from "../modules/restock";
import ProductModule from "@medusajs/medusa/product";

export default defineLink(
  {
    linkable: RestockModule.linkable.restockSubscription,
    field: "variant_id",
  },
  ProductModule.linkable.productVariant,
  {
    readOnly: true,
  },
);
