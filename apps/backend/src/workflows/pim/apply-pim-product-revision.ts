import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  acquireLockStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import {
  applyPimProductProjectionStep,
} from "./steps/apply-pim-product-projection"

type Input = {
  receipt_id: string
  source: string
  external_product_id: string
}

export const applyPimProductRevisionWorkflow = createWorkflow(
  "apply-pim-product-revision",
  (input: Input) => {
    const lockKey = transform({ input }, ({ input }) => {
      return `pim-product:${input.source}:${input.external_product_id}`
    })

    acquireLockStep({
      key: lockKey,
      timeout: 5,
      ttl: 60,
    })

    const result = applyPimProductProjectionStep(input)

    releaseLockStep({
      key: lockKey,
    })

    return new WorkflowResponse(result)
  }
)