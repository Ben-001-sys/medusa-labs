import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import {
  CreateRestockSubscriptionRequest,
  CreateRestockSubscriptionResponse,
} from "./types"

const RESTOCK_SUBSCRIPTIONS_PATH = "/store/restock-subscriptions"

export async function createRestockSubscription(
  body: CreateRestockSubscriptionRequest
): Promise<CreateRestockSubscriptionResponse> {
  if (!body.variant_id) {
    throw new Error("variant_id is required to create a restock subscription.")
  }

  try {
    await sdk.client.fetch(RESTOCK_SUBSCRIPTIONS_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "text/plain",
      },
      body,
    })

    return undefined
  } catch (error) {
    medusaError(error)
  }
}
