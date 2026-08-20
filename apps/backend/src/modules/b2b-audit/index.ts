// apps/backend/src/modules/b2b-audit/index.ts
import { Module } from "@medusajs/framework/utils"
import B2BAuditModuleService from "./service"

export const B2B_AUDIT_MODULE = "b2bAudit"

export default Module(B2B_AUDIT_MODULE, {
  service: B2BAuditModuleService,
})