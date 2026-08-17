export enum B2BPurchaseRequestStatus {
  PENDING_INTERNAL_APPROVAL = "pending_internal_approval",
  PENDING_MERCHANT_QUOTE = "pending_merchant_quote",
  PENDING_BUYER_ACCEPTANCE = "pending_buyer_acceptance",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  CONVERTED = "converted",
}

export enum B2BPurchaseApprovalDecision {
  APPROVED = "approved",
  REJECTED = "rejected",
}