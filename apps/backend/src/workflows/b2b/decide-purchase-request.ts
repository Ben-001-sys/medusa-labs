import { MedusaError } from "@medusajs/framework/utils";

import {
  createStep,
  createWorkflow,
  transform,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows";

import { B2B_ORGANIZATION_MODULE } from "../../modules/b2b-organization";

import B2BOrganizationModuleService from "../../modules/b2b-organization/service";

import {
  B2BOrganizationMemberStatus,
  B2BOrganizationRole,
} from "../../modules/b2b-organization/types";

import { B2B_PURCHASE_MODULE } from "../../modules/b2b-purchase";

import B2BPurchaseModuleService from "../../modules/b2b-purchase/service";

import {
  B2BPurchaseApprovalDecision,
  B2BPurchaseRequestStatus,
} from "../../modules/b2b-purchase/types";

type Input = {
  purchase_request_id: string;
  approver_customer_id: string;
  decision: "approved" | "rejected";
  note?: string;
};

const decidePurchaseRequestStep = createStep(
  "decide-b2b-purchase-request",
  async (input: Input, { container }) => {
    const purchaseService =
      container.resolve<B2BPurchaseModuleService>(B2B_PURCHASE_MODULE);

    const organizationService = container.resolve<B2BOrganizationModuleService>(
      B2B_ORGANIZATION_MODULE,
    );

    const request = await purchaseService.retrieveB2BPurchaseRequest(
      input.purchase_request_id,
    );

    if (request.status !== B2BPurchaseRequestStatus.PENDING_INTERNAL_APPROVAL) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This purchase request is not awaiting approval.",
      );
    }

    if (request.customer_id === input.approver_customer_id) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "A requester cannot approve their own purchase request.",
      );
    }

    const members = await organizationService.listB2BOrganizationMembers({
      organization_id: request.organization_id,
      customer_id: input.approver_customer_id,
      status: B2BOrganizationMemberStatus.ACTIVE,
    });

    const approver = members[0];

    if (
      !approver ||
      ![B2BOrganizationRole.OWNER, B2BOrganizationRole.APPROVER].includes(
        approver.role,
      )
    ) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You do not have approval authority.",
      );
    }

    const now = new Date();

    await purchaseService.createB2BPurchaseApprovals({
      purchase_request_id: request.id,
      approver_member_id: approver.id,
      decision:
        input.decision === "approved"
          ? B2BPurchaseApprovalDecision.APPROVED
          : B2BPurchaseApprovalDecision.REJECTED,
      note: input.note ?? null,
      decided_at: now,
    });

    if (input.decision === "rejected") {
      const updated = await purchaseService.updateB2BPurchaseRequests({
        id: request.id,
        status: B2BPurchaseRequestStatus.REJECTED,
        rejected_at: now,
      });

      return new StepResponse(updated);
    }

    const policy = request.policy_snapshot as Record<string, unknown>;

    const nextStatus =
      policy.requires_merchant_quote === true
        ? B2BPurchaseRequestStatus.PENDING_MERCHANT_QUOTE
        : B2BPurchaseRequestStatus.PENDING_BUYER_ACCEPTANCE;

    const updated = await purchaseService.updateB2BPurchaseRequests({
      id: request.id,
      status: nextStatus,
      approved_at: now,
    });

    return new StepResponse(updated);
  },
);

export const decideB2BPurchaseRequestWorkflow = createWorkflow(
  "decide-b2b-purchase-request",
  (input: Input) => {
    const lockKey = transform(
      { input },
      ({ input }) => `b2b-purchase-request:${input.purchase_request_id}`,
    );

    acquireLockStep({
      key: lockKey,
      timeout: 10,
      ttl: 60,
    });

    const request = decidePurchaseRequestStep(input);

    releaseLockStep({
      key: lockKey,
    });

    return new WorkflowResponse({
      purchase_request: request,
    });
  },
);
