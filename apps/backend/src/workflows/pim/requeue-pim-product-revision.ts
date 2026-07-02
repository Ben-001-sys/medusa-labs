import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  emitEventStep,
} from "@medusajs/medusa/core-flows"

type Input = {
  receipt_id: string
  source: string
  external_product_id: string
}

export const requeuePimProductRevisionWorkflow = createWorkflow(
  "requeue-pim-product-revision",
  (input: Input) => {
    emitEventStep({
      eventName: "pim.product_revision.received",
      data: input,
    })

    return new WorkflowResponse(input)
  }
)