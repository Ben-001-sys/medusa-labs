import crypto from "node:crypto";

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

import { B2B_PURCHASE_MODULE } from "../../../modules/b2b-purchase";

import B2BPurchaseModuleService from "../../../modules/b2b-purchase/service";

type Input = {
  organization_id: string;
  requester_member_id: string;
  customer_id: string;
  cart: Record<string, any>;

  draft_order_id: string;
  order_change_id: string;

  initial_status: string;
  requested_total: string | number;
  currency_code: string;
  purchase_order_number: string | null;
  policy_snapshot: Record<string, unknown>;
  submitted_at: Date;
  expires_at: Date;
};

export const createPurchaseRequestStep = createStep(
  "create-b2b-purchase-request",
  async (input: Input, { container }) => {
    const service =
      container.resolve<B2BPurchaseModuleService>(B2B_PURCHASE_MODULE);

    const reference = `BPR-${new Date()
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Call the service with a single payload object. Keep the payload
    // keys aligned with the model; if the service returns the created
    // request directly, this avoids destructuring non-iterables.
    const request = await service.createB2BPurchaseRequests({
      organization_id: input.organization_id,
      requester_member_id: input.requester_member_id,
      customer_id: input.customer_id,
      cart_id: input.cart.id,

      draft_order_id: input.draft_order_id,
      order_change_id: input.order_change_id,

      status: input.initial_status,

      requested_total: input.requested_total,
      currency_code: input.currency_code,

      purchase_order_number: input.purchase_order_number,

      cart_snapshot: {
        id: input.cart.id,
        currency_code: input.cart.currency_code,
        sales_channel_id: input.cart.sales_channel_id,
        region_id: input.cart.region_id,
        items: input.cart.items,
        shipping_address: input.cart.shipping_address,
        billing_address: input.cart.billing_address,
        shipping_methods: input.cart.shipping_methods,
        promotions: input.cart.promotions,
        total: input.cart.total,
      },

      policy_snapshot: input.policy_snapshot,

      submitted_at: input.submitted_at,
      expires_at: input.expires_at,
    } as any);

    return new StepResponse(request, {
      request_id: request.id,
    });
  },

  async (compensationData, { container }) => {
    if (!compensationData?.request_id) {
      return;
    }

    const service =
      container.resolve<B2BPurchaseModuleService>(B2B_PURCHASE_MODULE);

    await service.deleteB2BPurchaseRequests(compensationData.request_id);
  },
);
