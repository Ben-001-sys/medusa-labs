import { MedusaService } from "@medusajs/framework/utils"
import { PimEventReceipt } from "./models/pim-event-receipt"
import { PimProductSync } from "./models/pim-product-sync"

class PimConnectorModuleService extends MedusaService({
  PimEventReceipt,
  PimProductSync,
}) {}

export default PimConnectorModuleService