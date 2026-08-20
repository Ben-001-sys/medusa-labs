import crypto from "node:crypto";

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

import { B2B_AUDIT_MODULE } from "../../../modules/b2b-audit";

import B2BAuditModuleService from "../../../modules/b2b-audit/service";

import {
  B2BAuditActorType,
  B2BAuditOutcome,
} from "../../../modules/b2b-audit/types";

type Input = {
  action: string;
  outcome?: B2BAuditOutcome;

  entity_type: string;
  entity_id: string;

  organization_id?: string;

  actor_type: B2BAuditActorType;
  actor_id?: string;
  actor_display?: string;

  correlation_id?: string;
  causation_id?: string;

  reason_code?: string;
  note?: string;
  metadata?: Record<string, unknown>;
};

export const recordB2BAuditEventStep = createStep(
  "record-b2b-audit-event",
  async (input: Input, { container }) => {
    const auditService =
      container.resolve<B2BAuditModuleService>(B2B_AUDIT_MODULE);

    const event = await auditService.createB2BAuditEvents({
      event_id: crypto.randomUUID(),

      action: input.action,
      outcome: input.outcome ?? B2BAuditOutcome.SUCCESS,

      entity_type: input.entity_type,
      entity_id: input.entity_id,

      organization_id: input.organization_id ?? null,

      actor_type: input.actor_type,
      actor_id: input.actor_id ?? null,
      actor_display: input.actor_display ?? null,

      correlation_id: input.correlation_id ?? null,
      causation_id: input.causation_id ?? null,

      reason_code: input.reason_code ?? null,
      note: input.note ?? null,
      metadata: input.metadata ?? null,

      occurred_at: new Date(),
    });

    return new StepResponse(event);
  },
);
