import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"

import DeliverySlotModule from "../modules/delivery-slot"

export default defineLink(
  {
    linkable:
      DeliverySlotModule.linkable.deliverySlotReservation,
    field: "order_id",
  },
  OrderModule.linkable.order,
  {
    readOnly: true,
  }
)