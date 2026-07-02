import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

import {
  PIM_CONNECTOR_MODULE,
} from "../../../modules/pim-connector"

import PimConnectorModuleService from "../../../modules/pim-connector/service"

import {
  PimProductRevisionSchema,
} from "../../../modules/pim-connector/contracts"

import {
  PimEventStatus,
  PimProductSyncStatus,
} from "../../../modules/pim-connector/types"

type Input = {
  receipt_id: string
  source: string
  external_product_id: string
}

export const applyPimProductProjectionStep = createStep(
  "apply-pim-product-projection",
  async (input: Input, { container }) => {
    const connector =
      container.resolve<PimConnectorModuleService>(
        PIM_CONNECTOR_MODULE
      )

    const productModuleService =
      container.resolve(Modules.PRODUCT)

    const receipts =
      await connector.listPimEventReceipts({
        id: input.receipt_id,
        source: input.source,
      })

    const receipt = receipts[0]

    if (!receipt) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "PIM event receipt was not found."
      )
    }

    if (
      receipt.status === PimEventStatus.APPLIED ||
      receipt.status === PimEventStatus.IGNORED ||
      receipt.status === PimEventStatus.MANUAL_REVIEW
    ) {
      return new StepResponse({
        action: "ignored",
        receipt_id: receipt.id,
      })
    }

    const syncs =
      await connector.listPimProductSyncs({
        source: input.source,
        external_product_id: input.external_product_id,
      })

    const sync = syncs[0]

    if (!sync) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "PIM product sync record was not found."
      )
    }

    if (
      sync.status === PimProductSyncStatus.MANUAL_REVIEW ||
      receipt.revision !== sync.last_received_revision
    ) {
      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.IGNORED,
        processed_at: new Date(),
      })

      return new StepResponse({
        action: "ignored",
        receipt_id: receipt.id,
      })
    }

    const payload = PimProductRevisionSchema.parse(
      sync.latest_payload
    )

    const now = new Date()

    await connector.updatePimEventReceipts({
      id: receipt.id,
      attempt_count: receipt.attempt_count + 1,
      last_attempted_at: now,
    })

    let createdProductId: string | undefined

    try {
      let medusaProductId = sync.medusa_product_id

      if (medusaProductId) {
        await productModuleService.updateProducts(medusaProductId, {
          title: payload.product.title,
          handle: payload.product.handle,
          description: payload.product.description ?? null,
          // PIM may signal readiness, but this connector never auto-publishes.
          status: "draft",
        })
      } else {
        const product = await productModuleService.createProducts({
          title: payload.product.title,
          handle: payload.product.handle,
          description: payload.product.description ?? null,
          status: "draft",
          options: [
            {
              title: "Default option",
              values: ["Default option value"],
            },
          ],
        })

        createdProductId = product.id
        medusaProductId = product.id
      }

      await connector.updatePimProductSyncs({
        id: sync.id,
        medusa_product_id: medusaProductId,
        last_applied_revision: receipt.revision,
        status: PimProductSyncStatus.APPLIED,
        last_applied_at: now,
        last_error_code: null,
        last_error_message: null,
      })

      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.APPLIED,
        processed_at: now,
        error_code: null,
        error_message: null,
      })

      return new StepResponse({
        action: "applied",
        receipt_id: receipt.id,
        medusa_product_id: medusaProductId,
      })
    } catch (error) {
      if (createdProductId) {
        await productModuleService.deleteProducts([
          createdProductId,
        ])
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unknown PIM projection error."

      await connector.updatePimProductSyncs({
        id: sync.id,
        status: PimProductSyncStatus.FAILED,
        last_error_code: "projection_failed",
        last_error_message: message.slice(0, 1000),
      })

      await connector.updatePimEventReceipts({
        id: receipt.id,
        status: PimEventStatus.FAILED,
        error_code: "projection_failed",
        error_message: message.slice(0, 1000),
      })

      throw error
    }
  }
)