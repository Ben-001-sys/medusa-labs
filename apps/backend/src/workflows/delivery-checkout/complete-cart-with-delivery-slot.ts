import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import {
  acquireLockStep,
  completeCartWorkflow,
  releaseLockStep,
} from "@medusajs/medusa/core-flows";

import { getCartDeliveryReservationStep } from "./steps/get-cart-delivery-reservation";

import { claimDeliverySlotForCheckoutStep } from "./steps/claim-delivery-slot-for-checkout";

import { confirmDeliverySlotStep } from "./steps/confirm-delivery-slot";

type Input = {
  cart_id: string;
};

export const completeCartWithDeliverySlotWorkflow = createWorkflow(
  "complete-cart-with-delivery-slot",
  (input: Input) => {
    // Must match Medusa completeCartWorkflow cart lock key.
    const reservation = getCartDeliveryReservationStep({
      cart_id: input.cart_id,
    });

    const slotLockKey = transform(
      { reservation },
      ({ reservation }) => `delivery-slot:${reservation.slot_id}`,
    );

    acquireLockStep({
      key: [input.cart_id, slotLockKey],
      timeout: 30,
      ttl: 120,
    });

    claimDeliverySlotForCheckoutStep({
      cart_id: input.cart_id,
      reservation_id: reservation.reservation_id,
    });

    const { id: order_id } = completeCartWorkflow.runAsStep({
      input: {
        id: input.cart_id,
      },
    });

    const confirmedReservation = confirmDeliverySlotStep({
      reservation_id: reservation.reservation_id,
      order_id,
    });

    releaseLockStep({
      key: [slotLockKey, input.cart_id],
    });

    return new WorkflowResponse({
      order_id,
      delivery_reservation: confirmedReservation,
    });
  },
);
