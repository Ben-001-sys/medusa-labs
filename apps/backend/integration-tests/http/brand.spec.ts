import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import { POST as createBrandRoute } from "../../src/api/admin/brands/route";
import {
  GET as listBrandsRoute,
  POST as createBrandHttpRoute,
} from "../../src/api/admin/brands/route";
import {
  GET as retrieveBrandRoute,
  PUT as updateBrandRoute,
} from "../../src/api/admin/brands/[id]/route";
import BrandModuleService from "../../src/modules/brand/service";
import { BRAND_MODULE } from "../../src/modules/brand";

const makeBrandPayload = (prefix = "api") => ({
  name: `HTTP Brand ${prefix}`,
  handle: `http-brand-${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`,
});

medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    describe("brand admin API", () => {
      it("creates a brand through the admin create API route", async () => {
        const container = getContainer();
        const service = container.resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("create");

        const req: any = {
          scope: container,
          validatedBody: payload,
        };

        const res: any = {
          json: jest.fn((body) => body),
        };

        const response = await createBrandHttpRoute(req as any, res as any);

        expect(res.json).toHaveBeenCalled();
        expect(response).toBeUndefined();

        const output = res.json.mock.calls[0][0];
        expect(output.brand.name).toBe(payload.name);
        expect(output.brand.handle).toBe(payload.handle);

        await service.deleteBrands(output.brand.id);
      });

      it("lists brands through the admin list API route", async () => {
        const container = getContainer();
        const service = container.resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("list");

        const created = await service.createBrands(payload);

        const req: any = {
          scope: container,
          query: {},
          queryConfig: {
            limit: 10,
            offset: 0,
          },
        };

        const res: any = {
          json: jest.fn((body) => body),
        };

        await listBrandsRoute(req as any, res as any);

        const output = res.json.mock.calls[0][0];
        expect(output.brands).toBeDefined();
        expect(Array.isArray(output.brands)).toBe(true);

        await service.deleteBrands(created.id);
      });

      it("retrieves a brand through the admin get API route", async () => {
        const container = getContainer();
        const service = container.resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("get");

        const created = await service.createBrands(payload);

        const req: any = {
          scope: container,
          params: {
            id: created.id,
          },
        };

        const res: any = {
          json: jest.fn((body) => body),
        };

        await retrieveBrandRoute(req as any, res as any);

        const output = res.json.mock.calls[0][0];
        expect(output.brand.id).toBe(created.id);
        expect(output.brand.handle).toBe(payload.handle);

        await service.deleteBrands(created.id);
      });

      it("updates a brand through the admin update API route", async () => {
        const container = getContainer();
        const service = container.resolve<BrandModuleService>(BRAND_MODULE);
        const payload = makeBrandPayload("update-api");

        const created = await service.createBrands(payload);

        const req: any = {
          scope: container,
          params: {
            id: created.id,
          },
          validatedBody: {
            name: "Updated API Brand",
            handle: `${payload.handle}-updated`,
          },
        };

        const res: any = {
          json: jest.fn((body) => body),
        };

        await updateBrandRoute(req as any, res as any);

        const output = res.json.mock.calls[0][0];
        expect(output.brand.name).toBe("Updated API Brand");
        expect(output.brand.handle).toBe(`${payload.handle}-updated`);

        await service.deleteBrands(created.id);
      });
    });
  },
});

jest.setTimeout(60 * 1000);
