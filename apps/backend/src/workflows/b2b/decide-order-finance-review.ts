import { MedusaError } from "@medusajs/framework/utils";

import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import {
  acquireLockStep,
  releaseLockStep,
  emitEventStep,
} from "@medusajs/medusa/core-flows";

import { B2B_FINANCE_MODULE } from "../../modules/b2b-finance";

import B2BFinanceModuleService from "../../modules/b2b-finance/service";

import {
  B2BFinanceOperatorRole,
  B2BFinanceReviewStatus,
  B2BOrderReleaseStatus,
  B2BPaymentTermsStatus,
} from "../../modules/b2b-finance/types";

type Input = {
  finance_review_id: string;
  admin_user_id: string;
  decision: "approved_on_account" | "prepayment_required" | "rejected";
  reason_code?: string;
  note?: string;
};

const decideFinanceReviewStep = createStep(
  "decide-b2b-order-finance-review",
  async (input: Input, { container }) => {
    const financeService =
      container.resolve<B2BFinanceModuleService>(B2B_FINANCE_MODULE);

    const operators = await financeService.listB2BFinanceOperators({
      admin_user_id: input.admin_user_id,
      active: true,
    });

    const operator = operators[0];

    if (
      !operator ||
      ![
        B2BFinanceOperatorRole.APPROVER,
        B2BFinanceOperatorRole.RELEASE_OVERRIDE,
      ].includes(operator.role)
    ) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You do not have finance approval authority.",
      );
    }

    const review = await financeService.retrieveB2BOrderFinanceReview(
      input.finance_review_id,
    );

    if (review.status !== B2BFinanceReviewStatus.PENDING) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This finance review has already been decided.",
      );
    }

    const releases = await financeService.listB2BOrderReleases({
      finance_review_id: review.id,
    });

    const release = releases[0];

    if (!release) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Order release record is missing.",
      );
    }

    const now = new Date();

    if (input.decision === "rejected") {
      const updatedReview = await financeService.updateB2BOrderFinanceReviews({
        id: review.id,
        status: B2BFinanceReviewStatus.REJECTED,
        decision_by_admin_user_id: input.admin_user_id,
        decision_reason_code: input.reason_code ?? null,
        decision_note: input.note ?? null,
        reviewed_at: now,
      });

      const updatedRelease = await financeService.updateB2BOrderReleases({
        id: release.id,
        status: B2BOrderReleaseStatus.BLOCKED,
        blocked_at: now,
        blocked_reason_code: input.reason_code ?? "finance_rejected",
        blocked_reason_note: input.note ?? null,
      });

      return new StepResponse({
        review: updatedReview,
        release: updatedRelease,
        event_name: "b2b.finance.rejected",
      });
    }

    if (input.decision === "prepayment_required") {
      const updatedReview = await financeService.updateB2BOrderFinanceReviews({
        id: review.id,
        status: B2BFinanceReviewStatus.PREPAYMENT_REQUIRED,
        decision_by_admin_user_id: input.admin_user_id,
        decision_reason_code: input.reason_code ?? null,
        decision_note: input.note ?? null,
        reviewed_at: now,
      });

      const updatedRelease = await financeService.updateB2BOrderReleases({
        id: release.id,
        status: B2BOrderReleaseStatus.PREPAYMENT_REQUIRED,
        blocked_at: now,
        blocked_reason_code: "prepayment_required",
        blocked_reason_note: input.note ?? null,
      });

      return new StepResponse({
        review: updatedReview,
        release: updatedRelease,
        event_name: "b2b.finance.prepayment_required",
      });
    }

    const account = review.finance_account_id
      ? await financeService.retrieveB2BFinanceAccount(
          review.finance_account_id,
        )
      : null;

    if (!account || account.status !== "active") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No active finance account is available.",
      );
    }

    if (account.currency_code !== review.currency_code) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Finance account currency does not match order currency.",
      );
    }

    if (!account.payment_terms_code) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Payment terms are not configured for this account.",
      );
    }

    const dueAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedReview = await financeService.updateB2BOrderFinanceReviews({
      id: review.id,
      status: B2BFinanceReviewStatus.APPROVED_ON_ACCOUNT,
      payment_terms_code: account.payment_terms_code,
      decision_by_admin_user_id: input.admin_user_id,
      decision_reason_code: input.reason_code ?? null,
      decision_note: input.note ?? null,
      reviewed_at: now,
    });

    const obligation = await financeService.createB2BPaymentTermsObligations({
      order_id: review.order_id,
      finance_review_id: review.id,
      currency_code: review.currency_code,
      amount_due: review.order_total,
      payment_terms_code: account.payment_terms_code,
      due_at: dueAt,
      status: B2BPaymentTermsStatus.PENDING_INVOICE,
    });

    const updatedRelease = await financeService.updateB2BOrderReleases({
      id: release.id,
      status: B2BOrderReleaseStatus.ELIGIBLE_FOR_RELEASE,
    });

    return new StepResponse({
      review: updatedReview,
      release: updatedRelease,
      obligation,
      event_name: "b2b.finance.on_account_approved",
    });
  },
);

export const decideB2BOrderFinanceReviewWorkflow = createWorkflow(
  "decide-b2b-order-finance-review",
  (input: Input) => {
    const lockKey = transform(
      { input },
      ({ input }) => `b2b-finance-review:${input.finance_review_id}`,
    );

    acquireLockStep({
      key: lockKey,
      timeout: 15,
      ttl: 60,
    });

    const result = decideFinanceReviewStep(input);

    emitEventStep({
      eventName: transform({ result }, ({ result }) => result.event_name),
      data: transform({ result }, ({ result }) => ({
        order_id: result.review.order_id,
        finance_review_id: result.review.id,
        order_release_id: result.release.id,
      })),
    });

    releaseLockStep({
      key: lockKey,
    });

    return new WorkflowResponse(result);
  },
);
