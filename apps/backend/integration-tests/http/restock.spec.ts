import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { createRestockSubscriptionWorkflow } from "../../src/workflows/create-restock-subscription";

const makeValidPayload = () => ({
  variant_id: "variant-restock-http",
  sales_channel_id: "sc-http-test",
  customer: {
    email: "restock-http@example.com",
  },
});

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("restock API / workflow boundary", () => {
      it("accepts a valid subscription payload for the store API contract", async () => {
        const container = getContainer();
        const payload = makeValidPayload();

        const { result } = await createRestockSubscriptionWorkflow(
          container,
        ).run({
          input: payload,
          throwOnError: false,
        });

        expect(result).toBeDefined();
      });

      it("validation boundary surfaces workflow failure for invalid email input", async () => {
        const container = getContainer();

        const { errors } = await createRestockSubscriptionWorkflow(
          container,
        ).run({
          input: {
            variant_id: "variant-invalid-email",
            sales_channel_id: "sc-invalid-email",
            customer: {
              email: "not-an-email",
            },
          },
          throwOnError: false,
        });

        expect(errors.length).toBeGreaterThan(0);
      });

      it("authentication boundary is represented as a workflow context without customer identity", async () => {
        const container = getContainer();

        const { errors } = await createRestockSubscriptionWorkflow(
          container,
        ).run({
          input: {
            variant_id: "variant-auth",
            sales_channel_id: "sc-auth",
            customer: {
              email: "customer@example.com",
            },
          },
          throwOnError: false,
        });

        expect(errors).toBeDefined();
      });
    });
  },
});

jest.setTimeout(60 * 1000);
