import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import { createBrandWorkflow } from "../../../workflows/create-brand";
import { z } from "@medusajs/framework/zod";
import { PostAdminCreateBrand } from "./validators";
import { BRAND_MODULE } from "../../../modules/brand";
import BrandModuleService from "../../../modules/brand/service";

type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>;

const assertUniqueHandle = async (
  brandModuleService: BrandModuleService,
  handle: string,
  excludeId?: string,
) => {
  const existing = await brandModuleService.listBrands({ handle });
  const duplicate = existing.find((brand) => brand.id !== excludeId);

  if (duplicate) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `A brand with handle "${handle}" already exists`,
    );
  }
};

export const POST = async (
  req: MedusaRequest<PostAdminCreateBrandType>,
  res: MedusaResponse,
) => {
  const brandModuleService: BrandModuleService =
    req.scope.resolve(BRAND_MODULE);

  await assertUniqueHandle(brandModuleService, req.validatedBody.handle);

  const { result } = await createBrandWorkflow(req.scope).run({
    input: req.validatedBody,
  });

  res.json({ brand: result });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: brands, metadata: { count, take, skip } = {} } =
    await query.graph({
      entity: "brand",
      ...req.queryConfig,
    });

  res.json({
    brands,
    count,
    limit: take,
    offset: skip,
  });
};
