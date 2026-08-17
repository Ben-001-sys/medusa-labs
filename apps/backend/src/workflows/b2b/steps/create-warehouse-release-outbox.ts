import {
  MedusaError,
} from "@medusajs/framework/utils"

import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  B2B_FINANCE_MODULE,
} from "../../../modules/b2b-finance"

import B2BFinanceModuleService from
  "../../../modules/b2b-finance/service"

import {
  B2BOrderReleaseStatus,
} from "../../../modules/b2b-finance/types"

type Input = {
  order_id: string
}

export const createWarehouseReleaseOutboxStep = createStep(
  "create-b2b-warehouse-release-outbox",
  async ({ order_id }: Input, { container }) => {
    const financeService =
      container.resolve<B2BFinanceModuleService>(
        B2B_FINANCE_MODULE
      )

    const releases =
      await financeService.listB2BOrderReleases({
        order_id,
      })

    const release = releases[0]

    if (!release) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "B2B order release record was not found."
      )
    }

    if (
      release.status === B2BOrderReleaseStatus.RELEASED
    ) {
      return new StepResponse({
        action: "already_released",
        release,
      })
    }

    if (
      release.status !==
      B2BOrderReleaseStatus.ELIGIBLE_FOR_RELEASE
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Order is not finance-eligible for warehouse release."
      )
    }

    // Part 15 outbox creation belongs here.
    // It must use release.release_idempotency_key so retries
    // never create duplicate HubLoft requests.

    const updated =
      await financeService.updateB2BOrderReleases({
        id: release.id,
        status: B2BOrderReleaseStatus.RELEASED,
        released_at: new Date(),
      })

    return new StepResponse({
      action: "released",
      release: updated,
    })
  }
)