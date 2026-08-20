"use client"

import React from "react"
import {
  purchaseRequestLabel,
  purchaseRequestColor,
} from "@lib/util/b2b-status"
import { B2BPurchaseRequestStatus } from "@lib/types/b2b"

export default function PurchaseRequestStatus({
  status,
}: {
  status: B2BPurchaseRequestStatus
}) {
  const label = purchaseRequestLabel(status)
  const color = purchaseRequestColor(status)

  const bg =
    color === "green"
      ? "bg-green-100 text-green-800"
      : color === "red"
      ? "bg-red-100 text-red-800"
      : color === "blue"
      ? "bg-blue-100 text-blue-800"
      : color === "yellow"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800"

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg}`}>
      {label}
    </span>
  )
}
