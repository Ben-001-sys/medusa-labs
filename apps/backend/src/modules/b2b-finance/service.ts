import { MedusaService } from "@medusajs/framework/utils"

import { B2BFinanceAccount } from "./models/b2b-finance-account"
import { B2BOrderFinanceReview } from "./models/b2b-order-finance-review"
import { B2BOrderRelease } from "./models/b2b-order-release"
import { B2BPaymentTermsObligation } from "./models/b2b-payment-terms-obligation"
import { B2BFinanceOperator } from "./models/b2b-finance-operator"

class B2BFinanceModuleService extends MedusaService({
  B2BFinanceAccount,
  B2BOrderFinanceReview,
  B2BOrderRelease,
  B2BPaymentTermsObligation,
  B2BFinanceOperator,
}) {}

export default B2BFinanceModuleService