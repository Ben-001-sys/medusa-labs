import { Module } from "@medusajs/framework/utils"
import B2BFinanceModuleService from "./service"

export const B2B_FINANCE_MODULE = "b2bFinance"

export default Module(B2B_FINANCE_MODULE, {
  service: B2BFinanceModuleService,
})