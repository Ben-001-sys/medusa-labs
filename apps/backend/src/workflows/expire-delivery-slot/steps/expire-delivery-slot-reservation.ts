import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { DELIVERY_SLOT_MODULE } from "../../../modules/delivery-slot";
import DeliverySlotModuleService from "../../../modules/delivery-slot/service";
import { DeliverySlotReservationStatus } from "../../../modules/delivery-slot/types";

export type ExpireDeliverySlotReservationStepInput = {
  reservation_id: string;
};

export type ExpireReservationOutput = {
  reservation_id: string;
  expired: boolean;
  reason: "not_found" | "not_active" | "not_yet_expired" | null;
};

type CompensationInput = {
  reservation_id: string;
  previous_status: DeliverySlotReservationStatus | null;
  previous_order_id: string | null;
  previous_checkout_started_at: Date | null;
  previous_checkout_expires_at: Date | null;
  previous_confirmed_at: Date | null;
  previous_expired_at: Date | null;
};

type ReservationExpiryDecision = {
  action: "expire" | "confirm" | "reactivate" | "skip";
  reason: "not_found" | "not_active" | "not_yet_expired" | null;
};

export function getReservationExpiryDecision(
  reservation: {
    status: DeliverySlotReservationStatus;
    expires_at: Date | string | null;
    checkout_expires_at?: Date | string | null;
  },
  now: Date,
  hasOrder = false,
): ReservationExpiryDecision {
  if (reservation.status === DeliverySlotReservationStatus.ACTIVE) {
    const expiresAt = reservation.expires_at
      ? new Date(reservation.expires_at)
      : null;

    return expiresAt && expiresAt <= now
      ? { action: "expire", reason: null }
      : { action: "skip", reason: "not_yet_expired" };
  }

  if (reservation.status === DeliverySlotReservationStatus.CHECKOUT_PENDING) {
    const checkoutExpiresAt = reservation.checkout_expires_at
      ? new Date(reservation.checkout_expires_at)
      : null;

    if (!checkoutExpiresAt || checkoutExpiresAt > now) {
      return { action: "skip", reason: "not_yet_expired" };
    }

    return hasOrder
      ? { action: "confirm", reason: null }
      : { action: "reactivate", reason: null };
  }

  return { action: "skip", reason: "not_active" };
}

export const expireDeliverySlotReservationStep = createStep(
  "expire-delivery-slot-reservation",

  async (
    { reservation_id }: ExpireDeliverySlotReservationStepInput,
    { container },
  ): Promise<StepResponse<ExpireReservationOutput, CompensationInput>> => {
    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE);

    const reservations = await deliverySlotService.listDeliverySlotReservations(
      {
        id: reservation_id,
      },
    );

    const reservation = reservations[0];

    // The reservation may have been removed or changed after the job found it.
    if (!reservation) {
      return new StepResponse<ExpireReservationOutput, CompensationInput>({
        reservation_id,
        expired: false,
        reason: "not_found",
      });
    }

    const now = new Date();
    let hasOrder = false;

    if (
      reservation.status === DeliverySlotReservationStatus.CHECKOUT_PENDING &&
      reservation.checkout_expires_at
    ) {
      const checkoutExpiresAt = new Date(reservation.checkout_expires_at);

      if (checkoutExpiresAt <= now) {
        const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
          graph: (input: {
            entity: string;
            filters: Record<string, unknown>;
            fields: string[];
          }) => Promise<{ data: Array<{ id: string }> }>;
        };

        const result = await query.graph({
          entity: "order",
          filters: {
            cart_id: reservation.cart_id,
          },
          fields: ["id"],
        });

        hasOrder = result.data.length > 0;
      }
    }

    const decision = getReservationExpiryDecision(reservation, now, hasOrder);

    if (decision.action === "skip") {
      return new StepResponse<ExpireReservationOutput, CompensationInput>({
        reservation_id: reservation.id,
        expired: false,
        reason: decision.reason,
      });
    }

    let updatedReservation;

    if (decision.action === "expire") {
      updatedReservation =
        await deliverySlotService.updateDeliverySlotReservations({
          id: reservation.id,
          status: DeliverySlotReservationStatus.EXPIRED,
          expired_at: now,
        });
    } else if (decision.action === "confirm") {
      const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
        graph: (input: {
          entity: string;
          filters: Record<string, unknown>;
          fields: string[];
        }) => Promise<{ data: Array<{ id: string }> }>;
      };

      const result = await query.graph({
        entity: "order",
        filters: {
          cart_id: reservation.cart_id,
        },
        fields: ["id"],
      });

      const order = result.data[0] ?? null;

      updatedReservation =
        await deliverySlotService.updateDeliverySlotReservations({
          id: reservation.id,
          status: DeliverySlotReservationStatus.CONFIRMED,
          order_id: order?.id ?? null,
          confirmed_at: now,
          checkout_started_at: null,
          checkout_expires_at: null,
          expired_at: null,
        });
    } else {
      updatedReservation =
        await deliverySlotService.updateDeliverySlotReservations({
          id: reservation.id,
          status: DeliverySlotReservationStatus.ACTIVE,
          order_id: null,
          checkout_started_at: null,
          checkout_expires_at: null,
          confirmed_at: null,
          expired_at: null,
        });
    }

    return new StepResponse<ExpireReservationOutput, CompensationInput>(
      {
        reservation_id: updatedReservation.id,
        expired: decision.action === "expire",
        reason: null,
      },
      {
        reservation_id: reservation.id,
        previous_status: reservation.status,
        previous_order_id: reservation.order_id ?? null,
        previous_checkout_started_at: reservation.checkout_started_at ?? null,
        previous_checkout_expires_at: reservation.checkout_expires_at ?? null,
        previous_confirmed_at: reservation.confirmed_at ?? null,
        previous_expired_at: reservation.expired_at ?? null,
      },
    );
  },

  async (compensationData, { container }) => {
    if (!compensationData?.reservation_id) {
      return;
    }

    const deliverySlotService =
      container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE);

    await deliverySlotService.updateDeliverySlotReservations({
      id: compensationData.reservation_id,
      status:
        compensationData.previous_status ??
        DeliverySlotReservationStatus.ACTIVE,
      order_id: compensationData.previous_order_id,
      checkout_started_at: compensationData.previous_checkout_started_at,
      checkout_expires_at: compensationData.previous_checkout_expires_at,
      confirmed_at: compensationData.previous_confirmed_at,
      expired_at: compensationData.previous_expired_at,
    });
  },
);
