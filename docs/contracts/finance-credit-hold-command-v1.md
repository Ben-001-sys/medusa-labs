{
  "schema_version": "1.0",
  "command_id": "cmd_01J...",
  "command_type": "credit_hold.create",
  "producer": "wholesale-global-commerce",
  "requested_at": "2026-06-25T18:15:00.000Z",
  "idempotency_key": "finance-credit-hold:org_01J:order_01J:v1",
  "correlation_id": "order_01J...",
  "organization": {
    "id": "org_01J...",
    "external_finance_account_id": "erp_customer_1001"
  },
  "order": {
    "id": "order_01J...",
    "display_id": 1024,
    "currency_code": "ghs",
    "total": "50000.00"
  },
  "payment_terms": {
    "code": "NET_30"
  }
}