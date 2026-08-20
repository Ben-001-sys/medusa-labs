import { model } from "@medusajs/framework/utils"

import {
  B2BAuditActorType,
  B2BAuditOutcome,
} from "../types"

export const B2BAuditEvent = model
  .define("b2b_audit_event", {
    id: model.id().primaryKey(),

    event_id: model.text().unique(),

    action: model.text().index(),
    outcome: model
      .enum(Object.values(B2BAuditOutcome))
      .default(B2BAuditOutcome.SUCCESS),

    entity_type: model.text().index(),
    entity_id: model.text().index(),

    organization_id: model.text().index().nullable(),

    actor_type: model
      .enum(Object.values(B2BAuditActorType))
      .default(B2BAuditActorType.SERVICE),

    actor_id: model.text().index().nullable(),
    actor_display: model.text().nullable(),

    correlation_id: model.text().index().nullable(),
    causation_id: model.text().index().nullable(),

    reason_code: model.text().nullable(),
    note: model.text().nullable(),

    // Whitelisted facts only. Never store raw payment secrets,
    // full card data, identity evidence, or full address history.
    metadata: model.json().nullable(),

    occurred_at: model.dateTime().index(),
  })
  .indexes([
    {
      on: ["entity_type", "entity_id", "occurred_at"],
    },
    {
      on: ["organization_id", "occurred_at"],
    },
    {
      on: ["action", "outcome", "occurred_at"],
    },
  ])