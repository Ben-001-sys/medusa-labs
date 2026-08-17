import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows";

import { B2B_FINANCE_MODULE } from "../../modules/b2b-finance";

import B2BFinanceModuleService from "../../modules/b2b-finance/service";

import {
  B2BFinanceReviewStatus,
  B2BOrderReleaseStatus,
} from "../../modules/b2b-finance/types";

import { B2B_PURCHASE_MODULE } from "../../modules/b2b-purchase";

import B2BPurchaseModuleService from "../../modules/b2b-purchase/service";

type Input = {
  purchase_request_id: string;
  order_id: string;
};

const createFinanceReviewStep = createStep(
  "create-b2b-order-finance-review",
  async (input: Input, { container }) => {
    const financeService =
      container.resolve<B2BFinanceModuleService>(B2B_FINANCE_MODULE);

    const purchaseService =
      container.resolve<B2BPurchaseModuleService>(B2B_PURCHASE_MODULE);

    const existing = await financeService.listB2BOrderFinanceReviews({
      order_id: input.order_id,
    });

    if (existing.length > 0) {
      return new StepResponse({
        review: existing[0],
        action: "already_exists",
      });
    }

    const request = await purchaseService.retrieveB2BPurchaseRequest(
      input.purchase_request_id,
    );

    const accounts = await financeService.listB2BFinanceAccounts({
      organization_id: request.organization_id,
      currency_code: request.currency_code,
    });

    const financeAccount = accounts[0];

    const review = await financeService.createB2BOrderFinanceReviews({
      order_id: input.order_id,
      purchase_request_id: request.id,
      organization_id: request.organization_id,
      finance_account_id: financeAccount?.id ?? null,
      currency_code: request.currency_code,
      order_total: request.requested_total,
      status: B2BFinanceReviewStatus.PENDING,
    });

    const release = await financeService.createB2BOrderReleases({
      order_id: input.order_id,
      finance_review_id: review.id,
      status: B2BOrderReleaseStatus.FINANCE_PENDING,
      release_idempotency_key: `b2b-order-release:${input.order_id}:v1`,
    });

    return new StepResponse({
      review,
      release,
      action: "created",
    });
  },
);

export const createB2BOrderFinanceReviewWorkflow = createWorkflow(
  "create-b2b-order-finance-review",
  (input: Input) => {
    const lockKey = transform({ input }, ({ input }) => {
      return `b2b-finance-order:${input.order_id}`;
    });

    acquireLockStep({
      key: lockKey,
      timeout: 15,
      ttl: 60,
    });

    const result = createFinanceReviewStep(input);

    releaseLockStep({
      key: lockKey,
    });

    return new WorkflowResponse(result);
  },
);
