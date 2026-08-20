// apps/backend/src/modules/b2b-audit/service.ts
import { MedusaService } from "@medusajs/framework/utils"
import { B2BAuditEvent } from "./models/b2b-audit-event"

class B2BAuditModuleService extends MedusaService({
  B2BAuditEvent,
}) {}

export default B2BAuditModuleService