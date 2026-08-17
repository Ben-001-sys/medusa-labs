import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { z } from "@medusajs/framework/zod"

import {
  decideB2BOrderFinanceReviewWorkflow,
} from "../../../../../../workflows/b2b/decide-order-finance-review"

import {
  PostFinanceDecision,
} from "./validators"

type Body = z.infer<typeof PostFinanceDecision>

export const POST = async (
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) => {
  const { result } =
    await decideB2BOrderFinanceReviewWorkflow(
      req.scope
    ).run({
      input: {
        finance_review_id: req.params.id,
        admin_user_id: req.auth_context.actor_id,
        decision: req.validatedBody.decision,
        reason_code: req.validatedBody.reason_code,
        note: req.validatedBody.note,
      },
    })

  res.status(200).json(result)
}