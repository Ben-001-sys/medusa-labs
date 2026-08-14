# ADR 0014 — No-Fork and Upgrade Discipline

## Decision

We do not modify Medusa core source code or files in node_modules.

Customization order:

1. Configure Medusa.
2. Use storefront code where appropriate.
3. Use metadata for small record-bound values.
4. Use linked models for structured extension data.
5. Use additional_data, middleware, workflow hooks, subscribers, jobs,
   providers, connectors, modules, and plugins.
6. Replicate an API route only when Medusa extension points are insufficient.
7. Fork Medusa core only after architecture review and written approval.

## Consequences

- Every custom feature must state its Medusa extension point.
- Every replicated route requires tests and an upgrade checklist.
- Every Medusa upgrade runs through staging before production.
- No developer edits dependencies directly.