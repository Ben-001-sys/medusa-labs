"use client"

import React, { useEffect, useState } from "react"
import PurchaseRequestStatus from "./PurchaseRequestStatus.client"
import PaymentTermsClient from "./PaymentTerms.client"
import B2BReleaseStatus from "./B2BReleaseStatus.client"
import { Text, Button } from "@modules/common/components/ui"

export default function PurchaseRequestDetailClient({ id }: { id: string }) {
  const [pr, setPr] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      // Try fetch from store API if available
      try {
        const res = await fetch(
          `/store/customers/me/b2b/purchase-requests/${id}`,
          { credentials: "include" }
        )
        if (res.ok) {
          const json = await res.json()
          if (!mounted) return
          setPr(json)
          setLoading(false)
          return
        }
      } catch (e) {
        // ignore
      }

      // Fallback: try localStorage cache
      try {
        const raw = localStorage.getItem("b2b_purchase_requests")
        const map = raw ? JSON.parse(raw) : {}
        if (map && map[id]) {
          setPr(map[id])
          setLoading(false)
          return
        }
      } catch (e) {
        // ignore
      }

      if (mounted) {
        setError(
          "Purchase request details are not available from the server. If you just submitted a request, check the confirmation box shown after submission."
        )
        setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <Text>Loading…</Text>
  if (error) return <Text className="text-red-600">{error}</Text>
  if (!pr) return <Text>No purchase request found.</Text>
  const now = new Date()
  const expiresAt = pr.expires_at ? new Date(pr.expires_at) : null
  const isExpired = expiresAt ? expiresAt <= now : false
  const canAccept = pr.status === "pending_buyer_acceptance" && !isExpired

  const [accepting, setAccepting] = useState(false)
  const [acceptedResult, setAcceptedResult] = useState<any | null>(null)

  const handleAccept = async () => {
    if (!canAccept) return
    setAccepting(true)
    try {
      const res = await fetch(
        `/store/customers/me/b2b/purchase-requests/${id}/accept`,
        {
          method: "POST",
          credentials: "include",
        }
      )
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message || "Unable to accept quote")
      }
      // json should contain order_id and purchase_request
      setPr(json.purchase_request || json.purchase_request || json)
      setAcceptedResult(json)
      setAccepting(false)
    } catch (e: any) {
      setAccepting(false)
      alert(e?.message || String(e))
    }
  }

  const items = pr.cart_snapshot?.items || pr.cart_snapshot?.line_items || []
  const shipping =
    pr.cart_snapshot?.shipping_address || pr.cart_snapshot?.shipping || null

  return (
    <div className="p-4 border rounded">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Text className="font-semibold">{pr.reference}</Text>
          <div className="text-sm text-gray-600">
            Organization: {pr.organization_id}
          </div>
        </div>
        <PurchaseRequestStatus status={pr.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <Text className="text-gray-600">Requested total</Text>
          <div className="font-medium mt-1">
            {pr.requested_total} {pr.currency_code}
          </div>
        </div>

        <div>
          <Text className="text-gray-600">Purchase order</Text>
          <div className="font-medium mt-1">
            {pr.purchase_order_number ?? "—"}
          </div>
        </div>

        <div>
          <Text className="text-gray-600">Submitted</Text>
          <div className="font-medium mt-1">
            {pr.submitted_at ?? pr.created_at ?? "—"}
          </div>
        </div>

        <div>
          <Text className="text-gray-600">Expires</Text>
          <div className="font-medium mt-1">
            {pr.expires_at ? new Date(pr.expires_at).toLocaleString() : "—"}
          </div>
        </div>
      </div>

      {pr.draft_order_id && (
        <div className="mt-4 text-sm">
          <Text className="text-gray-600">Draft order / quote</Text>
          <div className="mt-1">Draft order id: {pr.draft_order_id}</div>
          {pr.order_change_id && (
            <div>Order change id: {pr.order_change_id}</div>
          )}
        </div>
      )}

      <div className="mt-6">
        <Text className="font-semibold">Items</Text>
        <div className="mt-2 divide-y">
          {items.length === 0 ? (
            <div className="py-2 text-sm text-gray-600">No items available</div>
          ) : (
            items.map((it: any) => (
              <div
                key={it.id || it.variant_id || JSON.stringify(it)}
                className="py-2 flex justify-between text-sm"
              >
                <div>
                  <div className="font-medium">
                    {it.title || it.name || it.variant_title}
                  </div>
                  <div className="text-gray-600">Qty: {it.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {(it.unit_price || it.price || it.total_price) ?? "—"}{" "}
                    {pr.currency_code}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {shipping && (
        <div className="mt-4">
          <Text className="font-semibold">Shipping</Text>
          <div className="mt-2 text-sm text-gray-700">
            {shipping.address_1 || shipping.address_line1 || "—"}
            {shipping.city ? `, ${shipping.city}` : ""}
            {shipping.postal_code ? ` ${shipping.postal_code}` : ""}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Text className="font-semibold">Approval history</Text>
        <div className="mt-2 text-sm">
          {pr.approvals && pr.approvals.length > 0 ? (
            pr.approvals.map((a: any) => (
              <div key={a.id || JSON.stringify(a)} className="py-1 border-b">
                <div className="text-sm">
                  {a.decision} by{" "}
                  {a.approver_member_id ?? a.approver_member ?? "—"}
                </div>
                {a.note ? (
                  <div className="text-xs text-gray-600">{a.note}</div>
                ) : null}
                <div className="text-xs text-gray-500">{a.decided_at}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-600">No approvals yet</div>
          )}
        </div>
      </div>

      <div className="mt-6">
        {acceptedResult ? (
          <div className="p-4 bg-green-50 border rounded">
            <Text className="font-semibold">Quote accepted</Text>
            <div className="mt-2 text-sm">
              Order created:{" "}
              {acceptedResult.order_id ?? acceptedResult.order_id}
            </div>
            <div className="mt-1 text-sm">Status: Finance review pending</div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" disabled>
              {/* placeholder for download/print etc */}
              View PDF
            </Button>
            <Button onClick={handleAccept} disabled={!canAccept || accepting}>
              {isExpired
                ? "Quote expired"
                : accepting
                ? "Accepting…"
                : "Accept Quote"}
            </Button>
          </div>
        )}
      </div>

      {/* Payment terms / prepayment UI for accepted requests */}
      {pr && (pr.order_id || acceptedResult) ? (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <PaymentTermsClient purchaseRequest={pr} />
          </div>
          <div>
            <B2BReleaseStatus purchaseRequestId={pr.id} orderId={pr.order_id} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
