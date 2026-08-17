# B2B Approval and Quote Decision

## Direct checkout
A B2B buyer can use normal checkout when no organization policy requires
approval, quotation, or purchase-request governance.

## Governed purchase
A B2B Purchase Request is created when:
- the cart meets or exceeds the organization's approval threshold; or
- the organization requires merchant quotation.

## Commercial snapshot
A governed purchase creates a Medusa draft order from the cart.

The original cart is not authoritative after submission.
The draft order is the governed commercial snapshot.

## Approval sequence
1. Internal organization approval, when required.
2. Merchant quote review, when required.
3. Buyer acceptance.
4. Draft order converts to a normal Medusa order.

## Not included
- Credit limit
- Net-payment terms
- Invoice collection
- ERP accounting posting
- Multi-level approval chains
- B2B delivery-slot selection