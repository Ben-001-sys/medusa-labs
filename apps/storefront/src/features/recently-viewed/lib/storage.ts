export const RECENTLY_VIEWED_STORAGE_KEY = "medusa:recently-viewed-products"
export const MAX_RECENTLY_VIEWED_PRODUCTS = 12

export type RecentlyViewedProduct = {
  id: string
  handle: string
  title: string
  thumbnail?: string | null
  viewedAt: string
}

export type RecentlyViewedProductInput = Omit<RecentlyViewedProduct, "viewedAt"> & {
  viewedAt?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

const isRecentlyViewedProduct = (
  value: unknown
): value is RecentlyViewedProduct => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    typeof value.handle === "string" &&
    typeof value.title === "string" &&
    (typeof value.thumbnail === "string" || value.thumbnail === null || value.thumbnail === undefined) &&
    typeof value.viewedAt === "string"
  )
}

const getStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readRecentlyViewedProducts = (): RecentlyViewedProduct[] => {
  const storage = getStorage()

  if (!storage) {
    return []
  }

  try {
    const serialized = storage.getItem(RECENTLY_VIEWED_STORAGE_KEY)

    if (!serialized) {
      return []
    }

    const parsed = JSON.parse(serialized)

    if (!Array.isArray(parsed)) {
      storage.removeItem(RECENTLY_VIEWED_STORAGE_KEY)
      return []
    }

    const validProducts = parsed.filter(isRecentlyViewedProduct)

    if (validProducts.length !== parsed.length) {
      storage.setItem(
        RECENTLY_VIEWED_STORAGE_KEY,
        JSON.stringify(validProducts)
      )
    }

    return validProducts
  } catch (error) {
    if (error instanceof SyntaxError) {
      storage.removeItem(RECENTLY_VIEWED_STORAGE_KEY)
    }

    return []
  }
}

export const writeRecentlyViewedProducts = (
  products: RecentlyViewedProduct[]
): boolean => {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(products.slice(0, MAX_RECENTLY_VIEWED_PRODUCTS))
    )
    return true
  } catch {
    return false
  }
}

export const addRecentlyViewedProduct = (
  product: RecentlyViewedProductInput
): RecentlyViewedProduct[] => {
  const nextProduct: RecentlyViewedProduct = {
    id: product.id,
    handle: product.handle,
    title: product.title,
    thumbnail: product.thumbnail ?? null,
    viewedAt: product.viewedAt ?? new Date().toISOString(),
  }

  const existingProducts = readRecentlyViewedProducts()
  const filteredProducts = existingProducts.filter(
    (existingProduct) =>
      existingProduct.id !== nextProduct.id &&
      existingProduct.handle !== nextProduct.handle
  )

  const updatedProducts = [nextProduct, ...filteredProducts].slice(
    0,
    MAX_RECENTLY_VIEWED_PRODUCTS
  )

  writeRecentlyViewedProducts(updatedProducts)

  return updatedProducts
}

export const removeRecentlyViewedProduct = (
  productIdOrHandle: string
): RecentlyViewedProduct[] => {
  const existingProducts = readRecentlyViewedProducts()
  const updatedProducts = existingProducts.filter(
    (product) =>
      product.id !== productIdOrHandle && product.handle !== productIdOrHandle
  )

  writeRecentlyViewedProducts(updatedProducts)

  return updatedProducts
}

export const clearRecentlyViewedProducts = (): boolean => {
  const storage = getStorage()

  if (!storage) {
    return false
  }

  try {
    storage.removeItem(RECENTLY_VIEWED_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
