export type B2BOrganization = {
  id: string
  display_name: string
  legal_name?: string | null
  handle: string
  sales_channel_id?: string | null
  customer_group_id?: string | null
  role?: string | null
}

export type B2BOrganizationMember = {
  id: string
  customer_id: string
  role: string
  status: string
  organization_id?: string
}

export type B2BCartContext = {
  id: string
  cart_id: string
  customer_id: string
  organization_id?: string
}

export enum B2BPurchaseRequestStatus {
  PENDING_INTERNAL_APPROVAL = "pending_internal_approval",
  PENDING_MERCHANT_QUOTE = "pending_merchant_quote",
  PENDING_BUYER_ACCEPTANCE = "pending_buyer_acceptance",
  QUOTED = "quoted",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export type B2BPurchaseRequest = {
  id: string
  reference: string
  organization_id: string
  requester_member_id: string
  customer_id: string
  cart_id: string
  status: B2BPurchaseRequestStatus
  currency_code: string
  requested_total: string
  purchase_order_number?: string | null
}
