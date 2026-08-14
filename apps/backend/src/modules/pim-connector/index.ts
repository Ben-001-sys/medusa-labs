import { Module } from "@medusajs/framework/utils"
import PimConnectorModuleService from "./service"

export const PIM_CONNECTOR_MODULE = "pimConnector"

export default Module(PIM_CONNECTOR_MODULE, {
  service: PimConnectorModuleService,
})