import { MedusaError, OrderStatus } from "@medusajs/framework/utils";

import {
  createWorkflow,
  createStep,
  transform,
  WorkflowResponse,
  StepResponse,
} from "@medusajs/framework/workflows-sdk";

import {
  acquireLockStep,
  confirmOrderEditRequestWorkflow,
  releaseLockStep,
  updateOrderWorkflow,
  useQueryGraphStep,
  emitEventStep,
} from "@medusajs/medusa/core-flows";

import { B2B_PURCHASE_MODULE } from "../../modules/b2b-purchase";

import B2BPurchaseModuleService from "../../modules/b2b-purchase/service";

import { B2BPurchaseRequestStatus } from "../../modules/b2b-purchase/types";

type Input = {
  purchase_request_id: string;
  customer_id: string;
};

export const acceptB2BPurchaseRequestWorkflow = createWorkflow(
  "accept-b2b-purchase-request",
  (input: Input) => {
    const lockKey = transform(
      { input },
      ({ input }) => `b2b-purchase-request:${input.purchase_request_id}`,
    );

    acquireLockStep({
      key: lockKey,
      timeout: 15,
      ttl: 90,
    });

    const { data: requests } = useQueryGraphStep({
      entity: "b2b_purchase_request",
      fields: ["id", "customer_id", "status", "draft_order_id", "expires_at"],
      filters: {
        id: input.purchase_request_id,
        customer_id: input.customer_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    });

    const request = requests[0];

    const validatePurchaseRequestStep = createStep(
      "validate-b2b-purchase-request",
      async ({ request }: { request: any }, { container }) => {
        if (
          request.status !== B2BPurchaseRequestStatus.PENDING_BUYER_ACCEPTANCE
        ) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "This request is not ready for buyer acceptance.",
          );
        }

        if (request.expires_at && new Date(request.expires_at) <= new Date()) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "This quote has expired.",
          );
        }

        return new StepResponse({
          draft_order_id: request.draft_order_id,
        });
      },
    );

    const validation = validatePurchaseRequestStep({ request });

    confirmOrderEditRequestWorkflow.runAsStep({
      input: {
        order_id: validation.draft_order_id,
        confirmed_by: input.customer_id,
      },
    });

    updateOrderWorkflow.runAsStep({
      input: {
        id: validation.draft_order_id,
        // `UpdateOrderWorkflowInput` requires `user_id`; pass the
        // requesting customer as the acting user for the update.
        user_id: input.customer_id,
      },
    });

    const orderId = transform(
      { validation },
      ({ validation }) => validation.draft_order_id,
    );

    const markConverted = transform(
      { request, orderId },
      ({ request, orderId }) => ({
        request_id: request.id,
        order_id: orderId,
      }),
    );

    // Custom module mutation is intentionally after Medusa's
    // order-edit confirmation and order conversion.
    const updatePurchaseRequestStep = createStep(
      "mark-b2b-purchase-request-converted",
      async (
        {
          request_id,
          order_id,
        }: {
          request_id: string;
          order_id?: string | null;
        },
        { container },
      ) => {
        const purchaseService =
          container.resolve<B2BPurchaseModuleService>(B2B_PURCHASE_MODULE);

        return new StepResponse(
          await purchaseService.updateB2BPurchaseRequests({
            id: request_id,
            status: B2BPurchaseRequestStatus.CONVERTED,
            order_id,
            accepted_at: new Date(),
          }),
        );
      },
    );

    const convertedRequest = updatePurchaseRequestStep(markConverted);

    emitEventStep({
      eventName: "b2b.purchase_request.converted",
      data: transform(
        { convertedRequest, orderId },
        ({ convertedRequest, orderId }) => ({
          purchase_request_id: convertedRequest.id,
          order_id: orderId,
        }),
      ),
    });

    releaseLockStep({
      key: lockKey,
    });

    return new WorkflowResponse({
      order_id: orderId,
      purchase_request: convertedRequest,
    });
  },
);
