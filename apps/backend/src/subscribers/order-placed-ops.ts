import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import { orderPlacedOpsNotificationWorkflow } from "../workflows/order-placed-notification-workflow/order-placed-ops-notification"

export default async function orderPlacedOpsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  logger.info(
    `Starting post-order operations notification for order ${data.id}`
  )

  await orderPlacedOpsNotificationWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}