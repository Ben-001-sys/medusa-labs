import { Module } from "@medusajs/framework/utils"

import B2BPurchaseModuleService from "./service"

export const B2B_PURCHASE_MODULE = "b2bPurchase"

export default Module(B2B_PURCHASE_MODULE, {
  service: B2BPurchaseModuleService,
})