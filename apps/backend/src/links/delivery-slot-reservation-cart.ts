import { defineLink } from "@medusajs/framework/utils"
import CartModule from "@medusajs/medusa/cart"
import DeliverySlotModule from "../modules/delivery-slot"

export default defineLink(
  {
    linkable: DeliverySlotModule.linkable.deliverySlotReservation,
    field: "cart_id",
  },
  CartModule.linkable.cart,
  {
    readOnly: true,
  }
)