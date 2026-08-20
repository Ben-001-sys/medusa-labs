"use server"

import { sdk } from "../config"
import { getAuthHeaders, getCartId } from "./cookies"
import { revalidateTag } from "next/cache"
import type {
  B2BOrganization,
  B2BCartContext,
  B2BPurchaseRequest,
} from "../types/b2b"

export async function retrieveCustomerOrganizations(): Promise<
  B2BOrganization[]
> {
  const headers = await getAuthHeaders()
  try {
    const res = await sdk.client.fetch(
      "/store/customers/me/b2b/organizations",
      {
        method: "GET",
        headers,
      }
    )

    // SDK may return parsed JSON or a Response-like object. Handle both.
    if (res && typeof res === "object") {
      // If it's already parsed JSON
      if ("organizations" in (res as any)) {
        return (res as any).organizations || []
      }

      // If it's a Response-like object
      const maybeRes = res as Response
      if (typeof (maybeRes as any).ok !== "undefined") {
        if (!maybeRes.ok) {
          let body = ""
          try {
            body =
              typeof maybeRes.text === "function" ? await maybeRes.text() : ""
          } catch {}
          // eslint-disable-next-line no-console
          console.error("Failed to fetch customer organizations", {
            status: (maybeRes as any).status,
            statusText: (maybeRes as any).statusText,
            body,
          })
          return []
        }

        try {
          const json = await maybeRes.json()
          return json.organizations || []
        } catch {
          return []
        }
      }
    }

    return []
  } catch (err: any) {
    // Network or SDK errors can throw — log and return empty list
    // eslint-disable-next-line no-console
    console.error("Error fetching customer organizations", err?.message || err)
    return []
  }
}

export async function retrieveCustomerPurchaseRequests(): Promise<
  B2BPurchaseRequest[]
> {
  const headers = await getAuthHeaders()
  try {
    const res = (await sdk.client.fetch(
      `/store/customers/me/b2b/purchase-requests`,
      {
        method: "GET",
        headers,
      }
    )) as Response

    if (!res.ok) {
      return []
    }

    const json = await res.json()
    return json.purchase_requests || []
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Error fetching purchase requests", err?.message || err)
    return []
  }
}

export async function selectOrganizationForCart(
  cartId: string,
  organizationId: string
): Promise<B2BCartContext> {
  const headers = await getAuthHeaders()
  const res = (await sdk.client.fetch(
    `/store/customers/me/b2b/carts/${cartId}/organization`,
    {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body: JSON.stringify({ organization_id: organizationId }),
    }
  )) as Response

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || "Failed to select organization for cart")
  }

  // Invalidate relevant cache tags used across storefront
  try {
    revalidateTag(`cart:${cartId}`)
    revalidateTag("customer")
  } catch (_) {
    // next/cache may be noop in some contexts; ignore
  }

  const json = await res.json()
  return json
}

export async function attachOrganizationToCart(
  _state: any,
  formData: FormData
): Promise<{ success: boolean; result?: any; error?: string | undefined }> {
  const organizationId = formData.get("organization_id") as string

  if (!organizationId) {
    return { success: false, error: "Organization ID is required" }
  }

  const cartId = await getCartId()

  if (!cartId) {
    return {
      success: false,
      error: "No cart found. Add items to a cart first.",
    }
  }

  try {
    const result = await selectOrganizationForCart(cartId, organizationId)

    return { success: true, result }
  } catch (err: any) {
    return { success: false, error: String(err.message || err) }
  }
}

export async function submitPurchaseRequest(
  cartId: string,
  purchaseOrderNumber?: string
): Promise<B2BPurchaseRequest> {
  const headers = await getAuthHeaders()
  const body: any = { cart_id: cartId }
  if (purchaseOrderNumber) {
    body.purchase_order_number = purchaseOrderNumber
  }

  const res = (await sdk.client.fetch(
    `/store/customers/me/b2b/purchase-requests`,
    {
      method: "POST",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }
  )) as Response

  if (!res.ok) {
    throw new Error("Failed to submit purchase request")
  }

  try {
    revalidateTag(`cart:${cartId}`)
    revalidateTag("customer")
    revalidateTag("orders")
  } catch (_) {}

  const json = await res.json()
  return json
}
