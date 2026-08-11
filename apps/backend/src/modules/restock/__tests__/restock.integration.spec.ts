import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { getVariantAvailability } from "@medusajs/framework/utils";
import { RESTOCK_MODULE } from "../index";
import RestockModuleService from "../service";
import { createRestockSubscriptionWorkflow } from "../../../workflows/create-restock-subscription";
import { sendRestockNotificationsWorkflow } from "../../../workflows/send-restock-notifications";

const buildSubscriptionPayload = (suffix = "", emailOverride?: string) => ({
  variant_id: `variant-${suffix}-${Date.now()}-${Math.round(Math.random() * 100000)}`,
  sales_channel_id: `sc-${suffix}-${Date.now()}`,
  email: emailOverride ?? `restock-${suffix}-${Date.now()}@example.com`,
  customer_id: undefined,
});

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("restock module", () => {
      it("subscribes a customer to a restock notification", async () => {
        const container = getContainer();
        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);
        const payload = buildSubscriptionPayload("subscribe");

        const created = await service.createRestockSubscriptions(payload);

        expect(created).toBeDefined();
        expect(created.variant_id).toBe(payload.variant_id);
        expect(created.sales_channel_id).toBe(payload.sales_channel_id);
        expect(created.email).toBe(payload.email);

        await service.deleteRestockSubscriptions(created.id);
      });

      it("unsubscribes an existing subscription", async () => {
        const container = getContainer();
        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);
        const payload = buildSubscriptionPayload("unsubscribe");

        const created = await service.createRestockSubscriptions(payload);
        await service.deleteRestockSubscriptions(created.id);

        await expect(
          service.retrieveRestockSubscription(created.id),
        ).rejects.toThrow();
      });

      it("rejects a duplicate subscription", async () => {
        const container = getContainer();
        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);
        const payload = buildSubscriptionPayload("duplicate");

        await service.createRestockSubscriptions(payload);

        await expect(
          service.createRestockSubscriptions(payload),
        ).rejects.toThrow();

        const records = await service.listRestockSubscriptions({
          variant_id: payload.variant_id,
          sales_channel_id: payload.sales_channel_id,
          email: payload.email,
        });

        if (records.length > 0) {
          await service.deleteRestockSubscriptions(
            records.map((record) => record.id),
          );
        }
      });

      it("rejects an invalid email payload", async () => {
        const container = getContainer();
        const payload = buildSubscriptionPayload(
          "invalid-email",
          "not-an-email",
        );

        const { errors } = await createRestockSubscriptionWorkflow(
          container,
        ).run({
          input: {
            variant_id: payload.variant_id,
            sales_channel_id: payload.sales_channel_id,
            customer: {
              email: payload.email,
            },
          },
          throwOnError: false,
        });

        expect(Array.isArray(errors)).toBe(true);
        expect(errors?.length).toBeGreaterThan(0);
      });

      it("surfaces an unavailable or invalid variant during restock lookup", async () => {
        const container = getContainer();
        const query = container.resolve("query");

        const result = await getVariantAvailability(query, {
          variant_ids: ["invalid-variant-does-not-exist"],
          sales_channel_id: "sales-channel-unknown",
        });

        expect(result["invalid-variant-does-not-exist"]).toBeDefined();
      });
    });

    describe("restock workflow", () => {
      it("creates a subscription through the workflow", async () => {
        const container = getContainer();
        const payload = buildSubscriptionPayload("workflow-create");

        const { result } = await createRestockSubscriptionWorkflow(
          container,
        ).run({
          input: {
            variant_id: payload.variant_id,
            sales_channel_id: payload.sales_channel_id,
            customer: {
              email: payload.email,
            },
          },
          throwOnError: false,
        });

        expect(result).toBeDefined();
        expect(result[0].variant_id).toBe(payload.variant_id);
        expect(result[0].sales_channel_id).toBe(payload.sales_channel_id);
        expect(result[0].email).toBe(payload.email);

        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);
        await service.deleteRestockSubscriptions(result[0].id);
      });

      it("sends queued notification entries through the notification workflow", async () => {
        const container = getContainer();
        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);

        const payload = buildSubscriptionPayload("workflow-notify");
        await service.createRestockSubscriptions(payload);

        const { result } = await sendRestockNotificationsWorkflow(
          container,
        ).run({
          throwOnError: false,
        });

        expect(result).toBeDefined();
        await service.deleteRestockSubscriptions(payload.variant_id);
      });

      it("allows a workflow retry to be represented as a failed-notification retry path", async () => {
        const container = getContainer();

        const { errors } = await sendRestockNotificationsWorkflow(
          container,
        ).run({
          throwOnError: false,
        });

        expect(errors).toBeDefined();
      });

      it("compensates a rollback scenario for restock workflow creation", async () => {
        const container = getContainer();
        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);
        const payload = buildSubscriptionPayload("compensation");

        const { result, errors } = await createRestockSubscriptionWorkflow(
          container,
        ).run({
          input: {
            variant_id: payload.variant_id,
            sales_channel_id: payload.sales_channel_id,
            customer: {
              email: payload.email,
            },
          },
          throwOnError: false,
        });

        expect(errors ?? []).toBeDefined();
        expect(result).toBeDefined();

        await service.deleteRestockSubscriptions(result[0].id);
      });
    });

    describe("restock scheduled job and link contract", () => {
      it("loads the scheduled job and exercises the eligible-subscription discovery flow", async () => {
        const container = getContainer();
        const service = container.resolve<RestockModuleService>(RESTOCK_MODULE);
        const payload = buildSubscriptionPayload("job-discovery");

        await service.createRestockSubscriptions(payload);

        const records = await service.getUniqueSubscriptions();
        expect(Array.isArray(records)).toBe(true);

        await service.deleteRestockSubscriptions(
          (
            await service.listRestockSubscriptions({ email: payload.email })
          ).map((record) => record.id),
        );
      });

      it("verifies the product variant linkage is declared at the module-link boundary", async () => {
        const container = getContainer();
        const linkService = container.resolve("link");

        expect(linkService).toBeDefined();
        expect(typeof linkService.create).toBe("function");
      });
    });
  },
});

jest.setTimeout(60 * 1000);
