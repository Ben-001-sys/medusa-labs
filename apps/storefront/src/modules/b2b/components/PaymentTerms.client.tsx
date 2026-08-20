"use client"

import React, { useEffect, useState } from "react"
import { Text, Button } from "@modules/common/components/ui"
import { sdk } from "@lib/config"

type Props = {
  purchaseRequest?: any
  purchaseRequestId?: string
}

export default function PaymentTermsClient({
  purchaseRequest,
  purchaseRequestId,
}: Props) {
  const [pr, setPr] = useState<any | null>(purchaseRequest || null)
  const [review, setReview] = useState<any | null>(null)
  const [cart, setCart] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)

      try {
        let _pr = pr
        if (!_pr && purchaseRequestId) {
          const res = await fetch(
            `/store/customers/me/b2b/purchase-requests/${purchaseRequestId}`,
            { credentials: "include" }
          )
          if (!res.ok) throw new Error("purchase request not available")
          _pr = await res.json()
        }

        if (!mounted) return
        setPr(_pr)

        // fetch finance review for the purchase request
        if (_pr && _pr.id) {
          const revRes = await fetch(
            `/store/customers/me/b2b/finance-reviews/${_pr.id}`,
            { credentials: "include" }
          )
          if (revRes.ok) {
            const json = await revRes.json()
            if (mounted) setReview(json)
          }

          // fetch cart if available to initiate payment session
          try {
            if (_pr.cart_id) {
              const { cart } = await sdk.store.cart.retrieve(_pr.cart_id)
              if (mounted) setCart(cart)
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [purchaseRequestId])

  if (loading) return <Text>Loading payment terms…</Text>
  if (error) return <Text className="text-red-600">{error}</Text>
  if (!review) return <Text>No payment terms available.</Text>

  const amount = review.order_total
  const currency = review.currency_code
  const due = review.valid_until
    ? new Date(review.valid_until).toLocaleDateString()
    : "—"

  const needsPayment =
    review.status === "prepayment_required" || review.status === "open"

  const handlePayNow = async () => {
    if (!cart) {
      alert("Unable to locate cart for payment.")
      return
    }
    setPaying(true)
    try {
      // pick first available provider
      const provs = await sdk.store.payment.listPaymentProviders()
      const providers = Array.isArray(provs)
        ? provs
        : (provs && (provs as any).payment_providers) || []
      const provider =
        (providers && providers.length > 0 && providers[0].id) || undefined

      const body = {
        provider_id: provider,
        data: {},
      }

      const resp = await sdk.store.payment.initiatePaymentSession(
        cart,
        body as any
      )

      const pc = (resp && (resp as any).payment_collection) || null
      // try to find redirect url in payment sessions
      const sessions = pc?.payment_sessions || []
      const redirect =
        sessions[0]?.data?.redirect_url || pc?.redirect_url || null
      if (redirect) {
        window.location.href = redirect
        return
      }

      // fallback: open the collection admin url if present
      if (pc?.id) {
        // user may complete via hosted flow, just reload to refresh status
        window.location.reload()
        return
      }

      alert("Payment initiated — follow provider flow.")
    } catch (e: any) {
      alert(e?.message || String(e))
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="p-4 border rounded">
      <Text className="font-semibold">Payment Terms</Text>
      <div className="mt-2 text-sm grid grid-cols-2 gap-4">
        <div>
          <Text className="text-gray-600">Terms</Text>
          <div className="font-medium mt-1">
            {review.payment_terms_code ?? "—"}
          </div>
        </div>

        <div>
          <Text className="text-gray-600">Amount due</Text>
          <div className="font-medium mt-1">
            {amount} {currency}
          </div>
        </div>

        <div>
          <Text className="text-gray-600">Due</Text>
          <div className="font-medium mt-1">{due}</div>
        </div>

        <div>
          <Text className="text-gray-600">Invoice</Text>
          <div className="font-medium mt-1">
            {review.external_invoice_id ?? "—"}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {needsPayment ? (
          <Button onClick={handlePayNow} disabled={paying}>
            {paying ? "Processing…" : "Pay Now"}
          </Button>
        ) : (
          <Text className="text-sm text-gray-600">
            Payment status: {review.status}
          </Text>
        )}
      </div>
    </div>
  )
}
