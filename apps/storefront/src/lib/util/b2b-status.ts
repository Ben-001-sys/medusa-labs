import { B2BPurchaseRequestStatus } from "../types/b2b"

export function purchaseRequestLabel(status: B2BPurchaseRequestStatus) {
  switch (status) {
    case B2BPurchaseRequestStatus.PENDING_INTERNAL_APPROVAL:
      return "Pending approval"
    case B2BPurchaseRequestStatus.PENDING_MERCHANT_QUOTE:
      return "Pending merchant quote"
    case B2BPurchaseRequestStatus.PENDING_BUYER_ACCEPTANCE:
      return "Pending buyer acceptance"
    case B2BPurchaseRequestStatus.QUOTED:
      return "Quoted"
    case B2BPurchaseRequestStatus.ACCEPTED:
      return "Accepted"
    case B2BPurchaseRequestStatus.REJECTED:
      return "Rejected"
    case B2BPurchaseRequestStatus.CANCELLED:
      return "Cancelled"
    default:
      return "Unknown"
  }
}

export function purchaseRequestColor(status: B2BPurchaseRequestStatus) {
  switch (status) {
    case B2BPurchaseRequestStatus.ACCEPTED:
      return "green"
    case B2BPurchaseRequestStatus.REJECTED:
      return "red"
    case B2BPurchaseRequestStatus.QUOTED:
      return "blue"
    case B2BPurchaseRequestStatus.PENDING_INTERNAL_APPROVAL:
    case B2BPurchaseRequestStatus.PENDING_MERCHANT_QUOTE:
    case B2BPurchaseRequestStatus.PENDING_BUYER_ACCEPTANCE:
      return "yellow"
    default:
      return "gray"
  }
}
