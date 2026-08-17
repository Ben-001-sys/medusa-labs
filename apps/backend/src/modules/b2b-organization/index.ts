import { Module } from "@medusajs/framework/utils"

import B2BOrganizationModuleService from "./service"

export const B2B_ORGANIZATION_MODULE = "b2bOrganization"

export default Module(B2B_ORGANIZATION_MODULE, {
  service: B2BOrganizationModuleService,
})