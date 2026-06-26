# ADR 0001 — Medusa Mastery Lab Boundaries

## Purpose
This project is a safe learning and reference implementation for scalable
Medusa architecture.

## System ownership

- Medusa owns live commerce execution:
  products projected for sale, prices, carts, checkout, orders, payments,
  promotions, inventory availability, fulfillment state.

- Next.js owns storefront UX and presentation.

- Future PIM owns canonical product truth:
  SKU, taxonomy, technical attributes, governance, approved product assets.

- Strapi owns editorial content:
  campaign pages, buying guides, landing pages, content blocks, editorial SEO.

- External warehouse/WMS owns physical warehouse execution.

- External transport/TMS owns dispatch, tracking, and proof of delivery.

## Rule
One authoritative writer per field.
Other systems may read, cache, project, or display that field.