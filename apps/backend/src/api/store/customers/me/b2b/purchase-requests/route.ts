import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { z } from "@medusajs/framework/zod"

import {
  submitB2BPurchaseRequestWorkflow,
} from "../../../../../../workflows/b2b/submit-purchase-request"

import {
  PostB2BPurchaseRequest,
} from "./validators"

type Body = z.infer<typeof PostB2BPurchaseRequest>

export const POST = async (
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) => {
  const { result } =
    await submitB2BPurchaseRequestWorkflow(
      req.scope
    ).run({
      input: {
        cart_id: req.validatedBody.cart_id,
        customer_id: req.auth_context.actor_id,
        purchase_order_number:
          req.validatedBody.purchase_order_number,
      },
    })

  res.status(201).json(result)
}