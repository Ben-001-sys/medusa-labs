import crypto from "node:crypto"
import type { PimProductRevision } from "../../../../modules/pim-connector/contracts"

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`
  }

  const object = value as Record<string, unknown>

  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
    .join(",")}}`
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function readHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
) {
  const value = headers[name]

  return Array.isArray(value) ? value[0] : value
}

export function verifyPimSignature(
  headers: Record<string, string | string[] | undefined>,
  body: PimProductRevision
) {
  const secret = process.env.PIM_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("PIM_WEBHOOK_SECRET is not configured.")
  }

  const timestamp = readHeader(headers, "x-pim-timestamp")
  const signature = readHeader(headers, "x-pim-signature")

  if (!timestamp || !signature) {
    return {
      valid: false,
      reason: "Missing PIM authentication headers.",
    }
  }

  const timestampMs = Date.parse(timestamp)

  console.log("Received timestamp:", timestamp)
  console.log("Server UTC:", new Date().toISOString())
  console.log("Parsed timestamp:", new Date(timestamp ?? "").toISOString())
  console.log("Difference (ms):", Math.abs(Date.now() - Date.parse(timestamp ?? "")))

  if (
    Number.isNaN(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > MAX_CLOCK_SKEW_MS
  ) {
    return {
      valid: false,
      reason: "Expired or invalid PIM request timestamp.",
    }
  }

  const productHash = sha256(stableStringify(body.product))

  const signingPayload = [
    timestamp,
    body.event_id,
    body.source,
    body.occurred_at,
    body.product.external_id,
    body.product.revision,
    productHash,
  ].join(".")

  console.log("Signing payload:", signingPayload)
  console.log("Product hash:", productHash)
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signingPayload)
    .digest("hex")

  const supplied = signature.replace(/^sha256=/, "")
  console.log("Expected:", expected)
  console.log("Supplied:", supplied)

  if (
    !/^[a-f0-9]{64}$/i.test(supplied) ||
    !crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(supplied, "hex")
    )
  ) {
    return {
      valid: false,
      reason: "Invalid PIM request signature.",
    }
  }

  return {
    valid: true,
    payload_hash: productHash,
  }

  
}