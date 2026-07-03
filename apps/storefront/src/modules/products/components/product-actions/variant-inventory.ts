import { HttpTypes } from "@medusajs/types"
import { isEqual } from "lodash"

export type SelectedVariantInventoryState = {
  selectedVariant?: HttpTypes.StoreProductVariant
  availableQuantity: number
  isOutOfStock: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export function getSelectedVariantInventoryState(
  product: HttpTypes.StoreProduct,
  options: Record<string, string | undefined>
): SelectedVariantInventoryState {
  const selectedVariant = product.variants?.find((variant) => {
    const variantOptions = optionsAsKeymap(variant.options)
    return isEqual(variantOptions, options)
  })

  const availableQuantity = selectedVariant?.inventory_quantity ?? 0

  const isOutOfStock = Boolean(
    selectedVariant &&
      selectedVariant.manage_inventory &&
      !selectedVariant.allow_backorder &&
      availableQuantity <= 0
  )

  return {
    selectedVariant,
    availableQuantity,
    isOutOfStock,
  }
}
