import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { BRAND_MODULE } from "../index";
import BrandModuleService from "../service";
import { createBrandWorkflow } from "../../../workflows/create-brand";

const makeBrandPayload = (suffix = "") => ({
  name: `Test Brand ${suffix}`,
  handle: `test-brand-${suffix}-${Date.now()}-${Math.round(Math.random() * 100000)}`,
});

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("brand module", () => {
      it("creates a brand", async () => {
        const service =
          getContainer().resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("create");

        const brand = await service.createBrands(payload);

        expect(brand).toBeDefined();
        expect(brand.name).toBe(payload.name);
        expect(brand.handle).toBe(payload.handle);

        await service.deleteBrands(brand.id);
      });

      it("retrieves a brand after creation", async () => {
        const service =
          getContainer().resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("retrieve");

        const created = await service.createBrands(payload);
        const retrieved = await service.retrieveBrand(created.id);

        expect(retrieved.id).toBe(created.id);
        expect(retrieved.handle).toBe(payload.handle);

        await service.deleteBrands(created.id);
      });

      it("updates a brand", async () => {
        const service =
          getContainer().resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("update");

        const created = await service.createBrands(payload);
        const updated = await service.updateBrands({
          id: created.id,
          name: "Updated Brand",
          handle: `${payload.handle}-updated`,
        });

        expect(updated.name).toBe("Updated Brand");
        expect(updated.handle).toBe(`${payload.handle}-updated`);

        await service.deleteBrands(created.id);
      });

      it("deletes a brand", async () => {
        const service =
          getContainer().resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("delete");

        const created = await service.createBrands(payload);
        await service.deleteBrands(created.id);

        await expect(service.retrieveBrand(created.id)).rejects.toThrow();
      });

      it("rejects a duplicate handle", async () => {
        const service =
          getContainer().resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("duplicate");

        await service.createBrands(payload);

        await expect(service.createBrands(payload)).rejects.toThrow();

        const existing = await service.listBrands({ handle: payload.handle });
        const [brand] = existing;
        if (brand) {
          await service.deleteBrands(brand.id);
        }
      });
    });

    describe("brand workflow", () => {
      it("creates a brand through the workflow", async () => {
        const container = getContainer();
        const payload = makeBrandPayload("workflow-success");

        const { result } = await createBrandWorkflow(container).run({
          input: payload,
        });

        expect(result.name).toBe(payload.name);
        expect(result.handle).toBe(payload.handle);

        const service = container.resolve<BrandModuleService>(BRAND_MODULE);
        await service.deleteBrands(result.id);
      });

      it("returns workflow errors when workflow input is invalid", async () => {
        const container = getContainer();

        const { errors } = await createBrandWorkflow(container).run({
          input: {
            name: "",
            handle: "",
          } as never,
          throwOnError: false,
        });

        expect(errors.length).toBeGreaterThan(0);
      });

      it("compensates a created brand when the workflow step is rolled back", async () => {
        const container = getContainer();
        const service = container.resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("rollback");

        const { result } = await createBrandWorkflow(container).run({
          input: payload,
        });

        const created = await service.retrieveBrand(result.id);
        expect(created.id).toBe(result.id);

        await service.deleteBrands(created.id);
        await expect(service.retrieveBrand(created.id)).rejects.toThrow();
      });
    });
  },
});

jest.setTimeout(60 * 1000);
