import { MedusaService } from "@medusajs/framework/utils"

import {
  B2BPurchaseRequest,
} from "./models/b2b-purchase-request"

import {
  B2BPurchaseApproval,
} from "./models/b2b-purchase-approval"

class B2BPurchaseModuleService extends MedusaService({
  B2BPurchaseRequest,
  B2BPurchaseApproval,
}) {}

export default B2BPurchaseModuleService