import { Module } from "@medusajs/framework/utils"
import DeliverySlotModuleService from "./service"

export const DELIVERY_SLOT_MODULE = "deliverySlot"

export default Module(DELIVERY_SLOT_MODULE, {
  service: DeliverySlotModuleService,
})