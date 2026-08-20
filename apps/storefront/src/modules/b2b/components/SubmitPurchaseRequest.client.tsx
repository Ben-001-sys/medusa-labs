"use client"

import React, { useState } from "react"
import { Button, Input, Text } from "@modules/common/components/ui"
import { useSubmitPurchaseRequest } from "@lib/hooks/use-b2b"
import type { HttpTypes } from "@medusajs/types"
import PurchaseRequestStatus from "./PurchaseRequestStatus.client"

export default function SubmitPurchaseRequest({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const [po, setPo] = useState<string>("")
  const [submittedPR, setSubmittedPR] = useState<any | null>(null)
  const mutation = useSubmitPurchaseRequest()

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!cart?.id) return

    try {
      const res = await mutation.mutateAsync({ cartId: cart.id, po })
      // mutation onSuccess invalidates queries; server returns the created purchase request
      setSubmittedPR(res)

      // persist to localStorage for later viewing (best-effort)
      try {
        const key = "b2b_purchase_requests"
        const raw = localStorage.getItem(key)
        const map = raw ? JSON.parse(raw) : {}
        map[res.id] = res
        localStorage.setItem(key, JSON.stringify(map))
      } catch {}
    } catch (err: any) {
      // handled by mutation state; optionally show message
      console.error("Failed to submit purchase request", err)
    }
  }

  // If a request has been submitted, show confirmation
  if (submittedPR) {
    return (
      <div className="p-4 border rounded">
        <Text className="font-semibold">Purchase request submitted</Text>
        <div className="mt-2 flex items-center gap-2">
          <Text className="text-sm">Reference: {submittedPR.reference}</Text>
          <PurchaseRequestStatus status={submittedPR.status} />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Requested total: {submittedPR.requested_total}{" "}
          {submittedPR.currency_code}
        </div>
        {submittedPR.purchase_order_number && (
          <div className="mt-1 text-sm text-gray-600">
            PO: {submittedPR.purchase_order_number}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <Text className="text-sm text-gray-700">
        If this order requires approval, submit a purchase request instead of
        checking out.
      </Text>
      <div className="flex gap-2">
        <Input
          name="purchase_order_number"
          placeholder="Purchase order number (optional)"
          value={po}
          onChange={(e) => setPo(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={(mutation as any).isPending}>
          {(mutation as any).isPending ? "Submitting..." : "Submit request"}
        </Button>
      </div>
      {mutation.isError && (
        <Text className="text-sm text-red-600">
          {(mutation.error as Error)?.message || "Failed to submit request"}
        </Text>
      )}
    </form>
  )
}
