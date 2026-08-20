# B2B Operations and ERP Controls

## Finance authority modes

### Manual pilot
An authorized finance operator is the decision authority.

### ERP-authoritative production
ERP/AR is authoritative for:
- credit exposure
- credit hold
- invoice status
- receivables
- overdue status

Medusa stores a commerce-facing projection and must wait for ERP
acknowledgement before warehouse release.

## Audit principle
Every sensitive B2B decision is append-only, attributable, and
operationally searchable.

## Release principle
Order accepted does not mean warehouse released.

A B2B order is released only after:
- finance eligibility is confirmed; and
- the warehouse-release outbox record is created successfully.