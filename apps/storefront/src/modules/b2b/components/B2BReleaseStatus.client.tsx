"use client"

import React, { useEffect, useState } from "react"
import { Text, Button } from "@modules/common/components/ui"
import { sdk } from "@lib/config"

export default function B2BReleaseStatus({
  purchaseRequestId,
  orderId,
}: {
  purchaseRequestId?: string
  orderId?: string
}) {
  const [release, setRelease] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const id = purchaseRequestId
        if (!id) {
          setError("no purchase request id")
          setLoading(false)
          return
        }

        const res = await fetch(
          `/store/customers/me/b2b/order-releases/${id}`,
          { credentials: "include" }
        )
        if (!res.ok) {
          const txt = await res.text()
          throw new Error(txt || "not found")
        }
        const json = await res.json()
        if (mounted) setRelease(json)
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
  }, [purchaseRequestId, orderId])

  if (loading) return <Text>Loading release status…</Text>
  if (error) return <Text className="text-red-600">{error}</Text>
  if (!release) return <Text>No release information available.</Text>

  return (
    <div className="p-3 border rounded text-sm">
      <div>
        <Text className="font-semibold">Release status</Text>
        <div className="mt-1">{release.status}</div>
      </div>

      <div className="mt-2">
        <Text className="text-gray-600">Blocked reason</Text>
        <div>{release.blocked_reason_code ?? "—"}</div>
        {release.blocked_reason_note ? (
          <div className="text-xs text-gray-600">
            {release.blocked_reason_note}
          </div>
        ) : null}
      </div>

      <div className="mt-2">
        <Text className="text-gray-600">Released at</Text>
        <div>{release.released_at ?? "—"}</div>
      </div>

      <div className="mt-2">
        <Text className="text-gray-600">HubLoft outbox ref</Text>
        <div>{release.hubloft_outbox_id ?? "—"}</div>
      </div>
    </div>
  )
}
