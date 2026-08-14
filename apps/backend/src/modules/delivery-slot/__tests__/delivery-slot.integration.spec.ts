import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { DELIVERY_SLOT_MODULE } from "../index";
import DeliverySlotModuleService from "../service";
import { DeliverySlotStatus, DeliverySlotReservationStatus } from "../types";
import { reserveDeliverySlotWorkflow } from "../../../workflows/reserve-delivery-slot";
import { expireDeliverySlotReservationWorkflow } from "../../../workflows/expire-delivery-slot";

const makeSlotPayload = (codeSuffix = "slot") => {
  const start = new Date(Date.now() + 60 * 60 * 1000);
  const end = new Date(Date.now() + 120 * 60 * 1000);

  return {
    code: `ds-${codeSuffix}-${Date.now()}-${Math.round(Math.random() * 100000)}`,
    region_id: "region-test",
    stock_location_id: "location-test",
    start_at: start,
    end_at: end,
    capacity: 2,
    status: DeliverySlotStatus.ACTIVE,
  };
};

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("delivery slot module", () => {
      it("creates, retrieves, updates, and deletes a delivery slot", async () => {
        const service =
          getContainer().resolve<DeliverySlotModuleService>(
            DELIVERY_SLOT_MODULE,
          );
        const payload = makeSlotPayload("create");

        const created = await service.createDeliverySlots(payload);
        const retrieved = await service.retrieveDeliverySlot(created.id);

        expect(retrieved.id).toBe(created.id);
        expect(retrieved.code).toBe(payload.code);

        const updated = await service.updateDeliverySlots({
          id: created.id,
          status: DeliverySlotStatus.DISABLED,
        });

        expect(updated.status).toBe(DeliverySlotStatus.DISABLED);

        await service.deleteDeliverySlots(created.id);
        await expect(
          service.retrieveDeliverySlot(created.id),
        ).rejects.toThrow();
      });

      it("creates and reuses a reservation record", async () => {
        const service =
          getContainer().resolve<DeliverySlotModuleService>(
            DELIVERY_SLOT_MODULE,
          );
        const slot = await service.createDeliverySlots(
          makeSlotPayload("reservation"),
        );

        const reservation = await service.createDeliverySlotReservations({
          cart_id: "cart-module-test",
          customer_id: "customer-module-test",
          slot_id: slot.id,
          status: DeliverySlotReservationStatus.ACTIVE,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        const listed = await service.listDeliverySlotReservations({
          cart_id: "cart-module-test",
          slot_id: slot.id,
          status: DeliverySlotReservationStatus.ACTIVE,
        });

        expect(listed.length).toBeGreaterThan(0);
        expect(listed[0].id).toBe(reservation.id);

        await service.deleteDeliverySlotReservations(reservation.id);
        await service.deleteDeliverySlots(slot.id);
      });

      it("marks reservation expiry state on the workflow boundary", async () => {
        const service =
          getContainer().resolve<DeliverySlotModuleService>(
            DELIVERY_SLOT_MODULE,
          );
        const slot = await service.createDeliverySlots(
          makeSlotPayload("expire"),
        );
        const reservation = await service.createDeliverySlotReservations({
          cart_id: "cart-expiry-test",
          customer_id: "customer-expiry-test",
          slot_id: slot.id,
          status: DeliverySlotReservationStatus.ACTIVE,
          expires_at: new Date(Date.now() - 1000),
        });

        const { result } = await expireDeliverySlotReservationWorkflow(
          getContainer(),
        ).run({
          input: {
            reservation_id: reservation.id,
            cart_id: reservation.cart_id,
            slot_id: slot.id,
          },
        });

        expect(result.expired).toBe(true);
        expect(result.reason).toBeNull();

        await service.deleteDeliverySlotReservations(reservation.id);
        await service.deleteDeliverySlots(slot.id);
      });
    });

    describe("delivery slot workflow", () => {
      it("rejects a fully booked slot when reservation capacity is exhausted", async () => {
        const container = getContainer();
        const service =
          container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE);
        const slot = await service.createDeliverySlots(makeSlotPayload("full"));

        const reservationOne = await service.createDeliverySlotReservations({
          cart_id: "cart-one",
          customer_id: "customer-one",
          slot_id: slot.id,
          status: DeliverySlotReservationStatus.ACTIVE,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        const reservationTwo = await service.createDeliverySlotReservations({
          cart_id: "cart-two",
          customer_id: "customer-two",
          slot_id: slot.id,
          status: DeliverySlotReservationStatus.ACTIVE,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        const { errors } = await reserveDeliverySlotWorkflow(container).run({
          input: {
            cart_id: "cart-three",
            customer_id: "customer-three",
            slot_id: slot.id,
          },
          throwOnError: false,
        });

        expect(errors.length).toBeGreaterThan(0);

        await service.deleteDeliverySlotReservations(reservationOne.id);
        await service.deleteDeliverySlotReservations(reservationTwo.id);
        await service.deleteDeliverySlots(slot.id);
      });

      it("returns an already reserved result for the same cart and slot", async () => {
        const container = getContainer();
        const service =
          container.resolve<DeliverySlotModuleService>(DELIVERY_SLOT_MODULE);
        const slot = await service.createDeliverySlots(
          makeSlotPayload("same-cart"),
        );

        const reservation = await service.createDeliverySlotReservations({
          cart_id: "cart-idempotent",
          customer_id: "customer-idempotent",
          slot_id: slot.id,
          status: DeliverySlotReservationStatus.ACTIVE,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        });

        const { result } = await reserveDeliverySlotWorkflow(container).run({
          input: {
            cart_id: "cart-idempotent",
            customer_id: "customer-idempotent",
            slot_id: slot.id,
          },
        });

        expect(result.already_reserved).toBe(true);
        expect(result.reservation.id).toBe(reservation.id);

        await service.deleteDeliverySlotReservations(reservation.id);
        await service.deleteDeliverySlots(slot.id);
      });
    });
  },
});

jest.setTimeout(60 * 1000);
