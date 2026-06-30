# Order Placed Subscriber Decision

## Requirement
Notify operations after an order is successfully placed.

## Chosen implementation
- Listen to Medusa's `order.placed` event.
- Execute a workflow from a subscriber.
- Retrieve the order using Query.
- Create a Medusa Admin feed notification.

## Why a subscriber
Operations notification is not required for checkout, payment, stock
reservation, or order creation to succeed.

## Not used
- Workflow hook
- Custom checkout route
- Frontend-only notification
- Custom Order table
- Direct external API call inside checkout

## Production direction
Later, the subscriber may trigger a HubLoft, CRM, Alicide, accounting,
or analytics workflow. Each external handoff must become idempotent and
observable through a dedicated connector.