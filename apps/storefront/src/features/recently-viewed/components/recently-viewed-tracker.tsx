"use client"

import { useEffect, useRef } from "react"

import { addRecentlyViewedProduct } from "../lib/storage"

type RecentlyViewedTrackerProps = {
  product: {
    id?: string | null
    handle?: string | null
    title?: string | null
    thumbnail?: string | null
  }
}

export default function RecentlyViewedTracker({
  product,
}: RecentlyViewedTrackerProps) {
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (hasTrackedRef.current) {
      return
    }

    if (!product.id || !product.handle || !product.title) {
      return
    }

    hasTrackedRef.current = true
    addRecentlyViewedProduct({
      id: product.id,
      handle: product.handle,
      title: product.title,
      thumbnail: product.thumbnail ?? null,
    })
  }, [product.id, product.handle, product.title, product.thumbnail])

  return null
}