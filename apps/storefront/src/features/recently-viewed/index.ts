export {
  RECENTLY_VIEWED_STORAGE_KEY,
  MAX_RECENTLY_VIEWED_PRODUCTS,
  addRecentlyViewedProduct,
  clearRecentlyViewedProducts,
  readRecentlyViewedProducts,
  removeRecentlyViewedProduct,
  writeRecentlyViewedProducts,
} from "./lib/storage"

export type {
  RecentlyViewedProduct,
  RecentlyViewedProductInput,
} from "./lib/storage"