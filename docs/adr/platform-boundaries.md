# Ecosystem Platform Boundaries

## Retail Global / Wholesale Global Medusa

Owns:
- commerce catalog projection
- prices
- sales channels
- carts
- checkout
- orders
- promotions
- payment and fulfillment orchestration

Does not own:
- canonical product governance
- editorial content
- warehouse execution
- supplier procurement
- transport dispatch
- ecosystem identity
- AI model routing
- compliance evidence

## PIM

Owns:
- SKU
- taxonomy
- product attributes
- canonical product content
- approved product assets
- product governance
- publication policy

Publishes:
- approved commerce projections

## HubLoft

Owns:
- receiving
- warehouse stock execution
- picking
- packing
- dispatch readiness

Consumes:
- fulfillment requests

Publishes:
- inventory and fulfillment updates

## Alicide

Owns:
- dispatch
- route/trip status
- driver assignment
- proof of delivery
- delivery exceptions

Consumes:
- confirmed delivery requests

Publishes:
- tracking and completion updates