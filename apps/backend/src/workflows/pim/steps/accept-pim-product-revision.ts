import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  PIM_CONNECTOR_MODULE,
} from "../../../modules/pim-connector"

import PimConnectorModuleService from "../../../modules/pim-connector/service"

import type {
  PimProductRevision,
} from "../../../modules/pim-connector/contracts"

import {
  PimEventStatus,
  PimProductSyncStatus,
} from "../../../modules/pim-connector/types"

type Input = PimProductRevision & {
  payload_hash: string
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  )
}

export const acceptPimProductRevisionStep = createStep(
  "accept-pim-product-revision",
  async (input: Input, { container }) => {
    const connector =
      container.resolve<PimConnectorModuleService>(
        PIM_CONNECTOR_MODULE
      )

    const now = new Date()

    const { payload_hash, ...payload } = input

    const existingReceipt =
      await connector.listPimEventReceipts({
        source: input.source,
        event_id: input.event_id,
      })

    if (existingReceipt.length > 0) {
      return new StepResponse({
        action: "duplicate",
        receipt_id: existingReceipt[0].id,
        source: input.source,
        external_product_id: input.product.external_id,
      })
    }

    let receipt

    try {
      receipt = await connector.createPimEventReceipts({
        source: input.source,
        event_id: input.event_id,
        event_type: input.event_type,
        external_product_id: input.product.external_id,
        revision: input.product.revision,
        payload_hash: input.payload_hash,
        status: PimEventStatus.RECEIVED,
        received_at: now,
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return new StepResponse({
          action: "duplicate",
          source: input.source,
          external_product_id: input.product.external_id,
        })
      }

      throw error
    }

    const existingSync =
      await connector.listPimProductSyncs({
        source: input.source,
        external_product_id: input.product.external_id,
      })

    const sync = existingSync[0]
   

    if (!sync) {
      await connector.createPimProductSyncs({
        source: input.source,
        external_product_id: input.product.external_id,
        last_received_revision: input.product.revision,
        last_payload_hash: input.payload_hash,
        latest_payload: payload,
        status: PimProductSyncStatus.PENDING,
        last_received_at: now,
      })

      return new StepResponse({
        action: "accepted",
        receipt_id: receipt.id,
        source: input.source,
        external_product_id: input.product.external_id,
      })
    }

    if (input.product.revision < sync.last_received_revision) {
      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.IGNORED,
        processed_at: now,
      })

      return new StepResponse({
        action: "stale",
        receipt_id: receipt.id,
        source: input.source,
        external_product_id: input.product.external_id,
      })
    }

    if (
      input.product.revision === sync.last_received_revision &&
      input.payload_hash !== sync.last_payload_hash
    ) {
      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.MANUAL_REVIEW,
        processed_at: now,
        error_code: "revision_payload_conflict",
        error_message:
          "Same revision arrived with a different payload hash.",
      })

      await connector.updatePimProductSyncs({
        id: sync.id,
        status: PimProductSyncStatus.MANUAL_REVIEW,
        last_error_code: "revision_payload_conflict",
        last_error_message:
          "Same revision arrived with a different payload hash.",
      })

      return new StepResponse({
        action: "conflict",
        receipt_id: receipt.id,
        source: input.source,
        external_product_id: input.product.external_id,
      })
    }

    if (input.product.revision === sync.last_received_revision) {
      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.IGNORED,
        processed_at: now,
      })

      return new StepResponse({
        action: "stale",
        receipt_id: receipt.id,
        source: input.source,
        external_product_id: input.product.external_id,
      })
    }

    
    await connector.updatePimProductSyncs({
      id: sync.id,
      last_received_revision: input.product.revision,
      last_payload_hash: input.payload_hash,
      latest_payload: payload,
      status: PimProductSyncStatus.PENDING,
      last_received_at: now,
      last_error_code: null,
      last_error_message: null,
    })

    return new StepResponse({
      action: "accepted",
      receipt_id: receipt.id,
      source: input.source,
      external_product_id: input.product.external_id,
    })
  }
)