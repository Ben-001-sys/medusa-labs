import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  sendNotificationsStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  order_id: string
}

export const orderPlacedOpsNotificationWorkflow = createWorkflow(
  "order-placed-ops-notification",
  ({ order_id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "currency_code",
        "total",
        "items.id",
        "items.title",
        "items.quantity",
      ],
      filters: {
        id: order_id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    })

    const notifications = transform({ orders }, ({ orders }) => {
      const order = orders[0]

      console.log(JSON.stringify(order, null, 2))
      
    const itemCount =
    order.items?.reduce((total, item) => {
        if (!item) return total
        return total + (item.quantity ?? 0)
    }, 0) ?? 0

      const orderReference = order.display_id
        ? `#${order.display_id}`
        : order.id

      return [
        {
          to: "",
          channel: "feed",
          template: "admin-ui",
          data: {
            title: `New order ${orderReference}`,
            description:
              `${itemCount} item(s) · ` +
              `${order.total} ${order.currency_code.toUpperCase()} · ` +
              `${order.email}`,
          },
        },
      ]
    })

    sendNotificationsStep(notifications).config({
      name: "send-order-ops-feed-notification",
      maxRetries: 3,
    })

    return new WorkflowResponse({
      order_id,
    })
  }
)