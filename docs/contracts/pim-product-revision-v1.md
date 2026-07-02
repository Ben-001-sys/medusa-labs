# PIM Product Revision Contract v1

## Direction
PIM → Medusa

## Event
product.upsert

## Source of truth
PIM owns the canonical product revision.
Medusa owns the commerce projection and live commerce state.

## Replay rule
The same source + event_id must be accepted at most once.

## Ordering rule
Product revisions are positive integers and must increase monotonically
per source + external_product_id.

## Projection rule
This contract creates or updates only a Medusa draft product shell:
- title
- handle
- description

It does not publish the product or manage:
- price
- inventory
- sales channels
- variants
- fulfillment
- supplier data
- editorial CMS content

## Deletion rule
A PIM deletion never directly deletes Medusa products.
Removal requires a separate archive/unpublish policy.