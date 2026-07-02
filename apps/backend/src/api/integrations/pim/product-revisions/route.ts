import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type {
  PimProductRevision,
} from "../../../../modules/pim-connector/contracts"

import {
  recordPimProductRevisionWorkflow,
} from "../../../../workflows/pim/record-pim-product-revision"

import {
  verifyPimSignature,
} from "./signature"

export const POST = async (
  req: MedusaRequest<PimProductRevision>,
  res: MedusaResponse
) => {
  const expectedSource = process.env.PIM_CONNECTOR_SOURCE

  if (
    expectedSource &&
    req.validatedBody.source !== expectedSource
  ) {
    return res.status(403).json({
      message: "Unexpected PIM source.",
    })
  }

  const signature = verifyPimSignature(
    req.headers,
    req.validatedBody
  )

  if (!signature.valid) {
    return res.status(401).json({
      message: signature.reason,
    })
  }

  const { result } =
    await recordPimProductRevisionWorkflow(req.scope).run({
      input: {
        ...req.validatedBody,
        payload_hash: signature.payload_hash,
      },
    })

  if (result.action === "conflict") {
    return res.status(409).json(result)
  }

  return res
    .status(result.action === "accepted" ? 202 : 200)
    .json(result)
}