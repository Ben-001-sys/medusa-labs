import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  acquireLockStep,
  beginOrderEditOrderWorkflow,
  createOrderWorkflow,
  releaseLockStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"

import {
  OrderStatus,
} from "@medusajs/framework/utils"

import {
  preparePurchaseRequestStep,
} from "./steps/prepare-purchase-request"

import {
  createPurchaseRequestStep,
} from "./steps/create-purchase-request"

type Input = {
  cart_id: string
  customer_id: string
  purchase_order_number?: string
}

export const submitB2BPurchaseRequestWorkflow =
  createWorkflow(
    "submit-b2b-purchase-request",
    (input: Input) => {
      acquireLockStep({
        key: input.cart_id,
        timeout: 15,
        ttl: 90,
      })

      const { data: carts } = useQueryGraphStep({
        entity: "cart",
        fields: [
          "id",
          "customer_id",
          "email",
          "sales_channel_id",
          "currency_code",
          "region_id",
          "billing_address.*",
          "shipping_address.*",
          "shipping_methods.*",
          "promotions.code",
          "items.*",
          "total",
        ],
        filters: {
          id: input.cart_id,
        },
        options: {
          throwIfKeyNotFound: true,
        },
      })

      const prepared = preparePurchaseRequestStep(
        transform({ carts, input }, ({ carts, input }) => ({
          cart: carts[0],
          customer_id: input.customer_id,
          purchase_order_number:
            input.purchase_order_number,
        }))
      )

      const draftOrderInput = transform(
        { prepared },
        ({ prepared }) => ({
          is_draft_order: true,
          status: OrderStatus.DRAFT,

          sales_channel_id:
            prepared.cart.sales_channel_id ?? undefined,

          customer_id: prepared.customer_id,
          email: prepared.cart.email ?? undefined,

          billing_address:
            prepared.cart.billing_address,

          shipping_address:
            prepared.cart.shipping_address,

          items: prepared.cart.items,

          region_id: prepared.cart.region_id ?? undefined,

          promo_codes:
            prepared.cart.promotions?.map(
              (promotion: { code?: string }) =>
                promotion.code
            ),

          currency_code: prepared.cart.currency_code,

          shipping_methods:
            prepared.cart.shipping_methods ?? [],
        })
      )

      const draftOrder = createOrderWorkflow.runAsStep({
        input: draftOrderInput,
      })

      const orderEditInput = transform(
        { draftOrder },
        ({ draftOrder }) => ({
          order_id: draftOrder.id,
          description: "B2B purchase request",
          internal_note: "",
          metadata: {},
        })
      )

      const orderChange =
        beginOrderEditOrderWorkflow.runAsStep({
          input: orderEditInput,
        })

      const requestInput = transform(
        {
          prepared,
          draftOrder,
          orderChange,
        },
        ({
          prepared,
          draftOrder,
          orderChange,
        }) => ({
          ...prepared,
          draft_order_id: draftOrder.id,
          order_change_id: orderChange.id,
        })
      )

      const request =
        createPurchaseRequestStep(requestInput)

      releaseLockStep({
        key: input.cart_id,
      })

      return new WorkflowResponse({
        purchase_request: request,
      })
    }
  )