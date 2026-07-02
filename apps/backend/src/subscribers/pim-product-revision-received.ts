import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import {
  applyPimProductRevisionWorkflow,
} from "../workflows/pim/apply-pim-product-revision"

type PimRevisionEvent = {
  receipt_id: string
  source: string
  external_product_id: string
}

export default async function pimProductRevisionReceived({
  event: { data },
  container,
}: SubscriberArgs<PimRevisionEvent>) {
  await applyPimProductRevisionWorkflow(container).run({
    input: data,
  })
}

export const config: SubscriberConfig = {
  event: "pim.product_revision.received",
}