import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import PimConnectorModule from "../modules/pim-connector"

export default defineLink(
  {
    linkable: PimConnectorModule.linkable.pimProductSync,
    field: "medusa_product_id",
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  }
)