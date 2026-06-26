# Recently Viewed Products Decision

## Requirement
Show a customer the products they recently opened.

## Chosen implementation
Next.js storefront + browser localStorage.

## Why
The feature is browser-scoped UX. It does not require durable server data,
customer identity, cross-device access, analytics, or operational staff tools.

## Explicitly not used
- Medusa custom module
- Medusa API route
- Workflow
- Subscriber
- Scheduled job
- Admin UI
- Product metadata
- Customer metadata

## Upgrade trigger
Move to a Medusa module only when we need cross-device persistence,
authenticated history, recommendation inputs, consent-aware analytics,
or account-level browsing history.