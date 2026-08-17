# B2B Organization Domain Decision

## Native Medusa responsibilities
- Customers
- Customer groups
- Price lists
- Tiered pricing
- Sales channels
- Carts
- Orders

## Custom B2B module responsibilities
- Organization account
- Buyer membership
- Buyer role
- Organization status
- Cart-to-organization context

## Scope
A cart may belong to one B2B organization only.

The organization context is immutable after first selection.
A buyer must create a new cart to buy for another organization.

## Pricing policy
Customer groups remain the native pricing mechanism.

This first version supports:
- a shared B2B pricing group; and
- optionally one organization-specific negotiated-price group per buyer.

Multi-organization negotiated pricing will use quote/approval logic later.