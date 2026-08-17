import {
  MedusaError,
} from "@medusajs/framework/utils"

import {
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  B2B_ORGANIZATION_MODULE,
} from "../../../modules/b2b-organization"

import B2BOrganizationModuleService from
  "../../../modules/b2b-organization/service"

import {
  B2BOrganizationMemberStatus,
  B2BOrganizationStatus,
} from "../../../modules/b2b-organization/types"

import {
  isAtOrAbove,
} from "../../../modules/b2b-purchase/money"

import {
  B2BPurchaseRequestStatus,
} from "../../../modules/b2b-purchase/types"

type Input = {
  cart: Record<string, any>
  customer_id: string
  purchase_order_number?: string
}

export const preparePurchaseRequestStep = createStep(
  "prepare-b2b-purchase-request",
  async (input: Input, { container }) => {
    const b2bService =
      container.resolve<B2BOrganizationModuleService>(
        B2B_ORGANIZATION_MODULE
      )

    const contexts =
      await b2bService.listB2BCartContexts({
        cart_id: input.cart.id,
        customer_id: input.customer_id,
      })

    const context = contexts[0]

    if (!context) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Select an organization for this cart before submission."
      )
    }

    const organization =
      await b2bService.retrieveB2BOrganization(
        context.organization_id
      )

    if (
      organization.status !== B2BOrganizationStatus.ACTIVE
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This organization is not active."
      )
    }

    const member =
      await b2bService.retrieveB2BOrganizationMember(
        context.member_id
      )

    if (
      member.status !==
      B2BOrganizationMemberStatus.ACTIVE
    ) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Your organization membership is inactive."
      )
    }

    if (
      input.cart.sales_channel_id !==
      organization.sales_channel_id
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart and organization sales channels do not match."
      )
    }

    if (!input.cart.items?.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A purchase request requires at least one cart item."
      )
    }

    const thresholdApplies =
      organization.approval_threshold &&
      organization.approval_currency_code ===
        input.cart.currency_code &&
      isAtOrAbove(
        input.cart.total,
        organization.approval_threshold
      )

    const quoteRequired =
      organization.requires_merchant_quote === true

    if (!thresholdApplies && !quoteRequired) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This cart is eligible for direct checkout."
      )
    }

    const initialStatus = thresholdApplies
      ? B2BPurchaseRequestStatus.PENDING_INTERNAL_APPROVAL
      : B2BPurchaseRequestStatus.PENDING_MERCHANT_QUOTE

    const now = new Date()

    const expiresAt = new Date(
      now.getTime() +
        organization.quote_validity_days *
          24 *
          60 *
          60 *
          1000
    )

    return new StepResponse({
      cart: input.cart,

      organization_id: organization.id,
      requester_member_id: member.id,
      customer_id: input.customer_id,

      initial_status: initialStatus,

      requested_total: input.cart.total,
      currency_code: input.cart.currency_code,

      purchase_order_number:
        input.purchase_order_number ?? null,

      policy_snapshot: {
        approval_threshold:
          organization.approval_threshold ?? null,
        approval_currency_code:
          organization.approval_currency_code ?? null,
        requires_merchant_quote:
          organization.requires_merchant_quote,
        quote_validity_days:
          organization.quote_validity_days,
        policy_version:
          organization.approval_policy_version,
      },

      submitted_at: now,
      expires_at: expiresAt,
    })
  }
)