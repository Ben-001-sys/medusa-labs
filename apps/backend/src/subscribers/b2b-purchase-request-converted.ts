import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import {
  createB2BOrderFinanceReviewWorkflow,
} from "../workflows/b2b/create-order-finance-review"

type EventData = {
  purchase_request_id: string
  order_id: string
}

export default async function handler({
  event: { data },
  container,
}: SubscriberArgs<EventData>) {
  await createB2BOrderFinanceReviewWorkflow(container).run({
    input: data,
  })
}

export const config: SubscriberConfig = {
  event: "b2b.purchase_request.converted",
}