# B2B Finance and Warehouse Release Decision

## Principle
An accepted B2B order is not automatically warehouse-releasable.

## Source of truth
- Medusa: order, commerce state, finance-review projection, release state.
- Finance/ERP: credit exposure, invoice, receivables, collections.

## Release policy
An order can be released to HubLoft only when one of these is true:
- finance approved eligible payment terms and credit hold exists; or
- prepayment is confirmed; or
- an authorized finance operator overrides the release with an audit reason.

## Explicitly excluded
- Accounting ledger
- Bank reconciliation
- Invoice tax accounting
- Collections workflow
- Direct ERP database access