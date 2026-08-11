import {
  medusaIntegrationTestRunner,
} from "@medusajs/test-utils"

import {
  reserveDeliverySlotWorkflow,
} from "../../src/workflows/reserve-delivery-slot"

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("delivery-slot reservation", () => {
      it("rejects a fully booked slot", async () => {
        const { errors } =
          await reserveDeliverySlotWorkflow(
            getContainer()
          ).run({
            input: {
              cart_id: "cart_test",
              customer_id: "cus_test",
              slot_id: "dslot_full",
            },
            throwOnError: false,
          })

        expect(errors.length).toBeGreaterThan(0)
      })
    })
  },
})

jest.setTimeout(60 * 1000)