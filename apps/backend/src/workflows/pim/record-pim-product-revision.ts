import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  acquireLockStep,
  emitEventStep,
  releaseLockStep,
} from "@medusajs/medusa/core-flows"

import type {
  PimProductRevision,
} from "../../modules/pim-connector/contracts"

import {
  acceptPimProductRevisionStep,
} from "./steps/accept-pim-product-revision"

type Input = PimProductRevision & {
  payload_hash: string
}

export const recordPimProductRevisionWorkflow = createWorkflow(
  "record-pim-product-revision",
  (input: Input) => {
    const lockKey = transform({ input }, ({ input }) => {
      return `pim-product:${input.source}:${input.product.external_id}`
    })

    acquireLockStep({
      key: lockKey,
      timeout: 3,
      ttl: 30,
    })

    const decision = acceptPimProductRevisionStep(input)

    const eventData = transform({ decision }, ({ decision }) => ({
      receipt_id: decision.receipt_id,
      source: decision.source,
      external_product_id: decision.external_product_id,
    }))

    when({ decision }, ({ decision }) => decision.action === "accepted").then(
      () => {
        emitEventStep({
          eventName: "pim.product_revision.received",
          data: eventData,
        })
      }
    )

    releaseLockStep({
      key: lockKey,
    })

    return new WorkflowResponse(decision)
  }
)