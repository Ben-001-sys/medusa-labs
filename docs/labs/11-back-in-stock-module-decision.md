# Back-in-Stock Subscription Module Decision

## Requirement
Allow customers and guests to request an email when an out-of-stock product
variant becomes available in their storefront's sales channel.

## Chosen implementation
A custom Back-in-Stock Module with:

- Subscription records
- Notification-attempt records
- Product Variant read-only link
- Store API route
- Subscription workflow
- Scheduled availability scan
- Notification workflow
- Unsubscribe flow
- Admin operations

## Scope
A subscription is unique by:

- variant_id
- sales_channel_id
- normalized email

## Source of truth
BackInStockSubscription is the source of truth for subscription state.
Medusa Inventory remains the source of truth for current availability.

## Important rule
Availability is evaluated in the variant's sales-channel context.
Do not use a browser stock value or raw stocked quantity alone.

## Not included yet
- SMS / WhatsApp
- Dynamic recommendation campaigns
- Supplier replenishment logic
- Marketing newsletter consent
- Cross-product alert bundles