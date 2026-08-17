import type { MedusaContainer } from "@medusajs/framework/types";

import { B2B_FINANCE_MODULE } from "../modules/b2b-finance";

import B2BFinanceModuleService from "../modules/b2b-finance/service";

import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  B2BFinanceReviewStatus,
  B2BPaymentTermsStatus,
} from "../modules/b2b-finance/types";

export default async function reconcileB2BFinance(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const financeService =
    container.resolve<B2BFinanceModuleService>(B2B_FINANCE_MODULE);

  const now = new Date();

  const expiredReviews = await financeService.listB2BOrderFinanceReviews({
    status: B2BFinanceReviewStatus.PENDING,
    valid_until: {
      $lte: now,
    },
  });

  for (const review of expiredReviews) {
    await financeService.updateB2BOrderFinanceReviews({
      id: review.id,
      status: B2BFinanceReviewStatus.MANUAL_REVIEW,
      decision_reason_code: "review_expired",
      decision_note: "Finance review exceeded its allowed review window.",
    });
  }

  const overdueObligations =
    await financeService.listB2BPaymentTermsObligations({
      status: B2BPaymentTermsStatus.OPEN,
      due_at: {
        $lte: now,
      },
    });

  for (const obligation of overdueObligations) {
    await financeService.updateB2BPaymentTermsObligations({
      id: obligation.id,
      status: B2BPaymentTermsStatus.OVERDUE,
    });
  }

  logger.info(
    `[b2b-finance] expired_reviews=${expiredReviews.length} ` +
      `overdue_obligations=${overdueObligations.length}`,
  );
}

export const config = {
  name: "reconcile-b2b-finance",
  schedule: {
    interval: 3_600_000,
  },
};
