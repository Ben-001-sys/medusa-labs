import BigNumber from "bignumber.js"

export function isAtOrAbove(
  amount: string | number,
  threshold: string | number
) {
  return new BigNumber(String(amount)).gte(
    new BigNumber(String(threshold))
  )
}