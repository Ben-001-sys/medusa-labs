"use client"

import { useEffect, useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/common/components/ui"

import Thumbnail from "@modules/products/components/thumbnail"
import {
  readRecentlyViewedProducts,
  type RecentlyViewedProduct,
} from "../lib/storage"

type RecentlyViewedSectionProps = {
  currentHandle: string
}

export default function RecentlyViewedSection({
  currentHandle,
}: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<RecentlyViewedProduct[]>([])

  useEffect(() => {
    const viewedProducts = readRecentlyViewedProducts()
    const filteredProducts = viewedProducts.filter(
      (product) => product.handle !== currentHandle
    )

    setProducts(filteredProducts)
  }, [currentHandle])

  if (!products.length) {
    return null
  }

  return (
    <div className="content-container my-16 small:my-24" data-testid="recently-viewed-section">
      <div className="flex flex-col gap-y-6">
        <Heading level="h2" className="text-xl">
          Recently viewed
        </Heading>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-3 medium:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
                <div className="flex flex-col gap-y-3">
                  <Thumbnail
                    thumbnail={product.thumbnail}
                    images={[]}
                    size="full"
                    isFeatured={false}
                  />
                  <Text className="text-sm text-ui-fg-subtle group-hover:text-ui-fg-base">
                    {product.title}
                  </Text>
                </div>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}