import { MedusaService } from "@medusajs/framework/utils"

import { B2BOrganization } from "./models/b2b-organization"
import { B2BOrganizationMember } from "./models/b2b-organization-member"
import { B2BCartContext } from "./models/b2b-cart-context"

class B2BOrganizationModuleService extends MedusaService({
  B2BOrganization,
  B2BOrganizationMember,
  B2BCartContext,
}) {}

export default B2BOrganizationModuleService