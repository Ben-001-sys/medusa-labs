{
  "schema_version": "1.0",
  "command_id": "cmd_01J...",
  "command_type": "fulfillment.request.create",
  "producer": "retail-global-commerce",
  "idempotency_key": "retail-global:order:order_01J...:fulfillment-v1",
  "requested_at": "2026-06-25T18:15:00.000Z",
  "order": {
    "id": "order_01J...",
    "display_id": 1024,
    "currency_code": "usd"
  },
  "fulfillment": {
    "method": "delivery",
    "stock_location_id": "sloc_01J..."
  },
  "recipient": {
    "name": "Customer Name",
    "phone": "+233...",
    "address": {
      "address_1": "..."
    }
  },
  "items": [
    {
      "order_line_item_id": "item_01J...",
      "sku": "SKU-001",
      "quantity": 2
    }
  ]
}

{
  "accepted": true,
  "hubloft_fulfillment_request_id": "hfr_01J...",
  "status": "queued"
}