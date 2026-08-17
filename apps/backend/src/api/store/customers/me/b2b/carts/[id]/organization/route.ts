import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { z } from "@medusajs/framework/zod"

import {
  selectOrganizationForCartWorkflow,
} from "../../../../../../../../workflows/b2b/select-organization-for-cart"

import {
  PostSelectB2BOrganization,
} from "./validators"

type Body = z.infer<typeof PostSelectB2BOrganization>

export const POST = async (
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) => {
  const salesChannelIds =
    req.publishable_key_context?.sales_channel_ids ?? []

  const { result } =
    await selectOrganizationForCartWorkflow(
      req.scope
    ).run({
      input: {
        cart_id: req.params.id,
        customer_id: req.auth_context.actor_id,
        organization_id: req.validatedBody.organization_id,
        allowed_sales_channel_ids: salesChannelIds,
      },
    })

  res.status(200).json(result)
}