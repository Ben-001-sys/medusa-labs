import type {
  MedusaContainer,
} from "@medusajs/framework/types"

import {
  PIM_CONNECTOR_MODULE,
} from "../modules/pim-connector"

import PimConnectorModuleService from "../modules/pim-connector/service"

import {
  PimEventStatus,
  PimProductSyncStatus,
} from "../modules/pim-connector/types"

import {
  requeuePimProductRevisionWorkflow,
} from "../workflows/pim/requeue-pim-product-revision"

const MAX_ATTEMPTS = 5

export default async function requeuePimProductRevisions(
  container: MedusaContainer
) {
  const connector =
    container.resolve<PimConnectorModuleService>(
      PIM_CONNECTOR_MODULE
    )

  const logger = container.resolve("logger")

  const received = await connector.listPimEventReceipts({
    status: PimEventStatus.RECEIVED,
  })

  const failed = await connector.listPimEventReceipts({
    status: PimEventStatus.FAILED,
  })

  const candidates = [...received, ...failed]

  let queued = 0
  let manualReview = 0

  for (const receipt of candidates) {
    if (receipt.attempt_count >= MAX_ATTEMPTS) {
      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.MANUAL_REVIEW,
        processed_at: new Date(),
        error_code: "max_attempts_exceeded",
        error_message:
          "Automatic retries stopped. Staff review is required.",
      })

      const syncs = await connector.listPimProductSyncs({
        source: receipt.source,
        external_product_id: receipt.external_product_id,
      })

      if (syncs[0]) {
        await connector.updatePimProductSyncs({
          id: syncs[0].id,
          status: PimProductSyncStatus.MANUAL_REVIEW,
        })
      }

      manualReview += 1
      continue
    }

    await requeuePimProductRevisionWorkflow(container).run({
      input: {
        receipt_id: receipt.id,
        source: receipt.source,
        external_product_id: receipt.external_product_id,
      },
    })

    queued += 1
  }

  logger.info(
    `[pim-reconciliation] queued=${queued} manual_review=${manualReview}`
  )
}

export const config = {
  name: "requeue-pim-product-revisions",
  schedule: {
    interval: 300_000,
  },
}