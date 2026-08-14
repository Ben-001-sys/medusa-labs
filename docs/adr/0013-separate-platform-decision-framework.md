# ADR 0013 — Separate Platform Decision Framework

## Context
The ecosystem contains commerce, PIM, CMS, WMS, procurement, transport,
AI, identity, and compliance capabilities.

## Decision
Medusa remains the commerce execution platform.

A capability becomes a separate platform when it has independent consumers,
durable domain ownership, separate security/availability requirements,
or an independent roadmap.

Medusa integrates through connector modules, explicit contracts,
idempotency records, workflows, subscribers, and scheduled reconciliation.

## Consequences
- No shared database across platforms.
- No uncontrolled two-way data ownership.
- Every integration has a named source of truth.
- Every connector has retry and reconciliation behavior.
- Platform teams own their own operational Admin experiences.