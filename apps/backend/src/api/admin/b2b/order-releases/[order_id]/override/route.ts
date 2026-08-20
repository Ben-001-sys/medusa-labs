import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";

import { B2B_FINANCE_MODULE } from "../../../../../../modules/b2b-finance";
import B2BFinanceModuleService from "../../../../../../modules/b2b-finance/service";
import {
  B2BFinanceOperatorRole,
  B2BOrderReleaseStatus,
} from "../../../../../../modules/b2b-finance/types";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { order_id } = req.params as { order_id: string };

  const financeService =
    req.scope.resolve<B2BFinanceModuleService>(B2B_FINANCE_MODULE);

  const operators = await financeService.listB2BFinanceOperators({
    admin_user_id: req.auth_context.actor_id,
    active: true,
  });
  const operator = operators[0];

  if (!operator || operator.role !== B2BFinanceOperatorRole.RELEASE_OVERRIDE) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "You do not have release override authority.",
    );
  }

  const releases = await financeService.listB2BOrderReleases({ order_id });
  const release = releases[0];

  if (!release) {
    return res.status(404).json({ message: "release_not_found" });
  }

  if (release.status === B2BOrderReleaseStatus.RELEASED) {
    return res.status(200).json({ action: "already_released", release });
  }

  const updated = await financeService.updateB2BOrderReleases({
    id: release.id,
    status: B2BOrderReleaseStatus.RELEASED,
    released_by_admin_user_id: req.auth_context.actor_id,
    released_at: new Date(),
  });

  res.status(200).json({ action: "force_released", release: updated });
};
