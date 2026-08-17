export enum B2BFinanceAccountStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  EXPIRED = "expired",
}

export enum B2BFinanceReviewStatus {
  PENDING = "pending",
  APPROVED_ON_ACCOUNT = "approved_on_account",
  PREPAYMENT_REQUIRED = "prepayment_required",
  REJECTED = "rejected",
  MANUAL_REVIEW = "manual_review",
  CANCELLED = "cancelled",
}

export enum B2BOrderReleaseStatus {
  FINANCE_PENDING = "finance_pending",
  PREPAYMENT_REQUIRED = "prepayment_required",
  ELIGIBLE_FOR_RELEASE = "eligible_for_release",
  RELEASED = "released",
  BLOCKED = "blocked",
  CANCELLED = "cancelled",
}

export enum B2BPaymentTermsStatus {
  PENDING_INVOICE = "pending_invoice",
  OPEN = "open",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  OVERDUE = "overdue",
  VOID = "void",
}

export enum B2BFinanceOperatorRole {
  VIEWER = "viewer",
  APPROVER = "approver",
  RELEASE_OVERRIDE = "release_override",
}