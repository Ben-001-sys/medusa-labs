import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { MedusaError } from "@medusajs/framework/utils";
import { z } from "@medusajs/framework/zod";
import { BRAND_MODULE } from "../../../../modules/brand";
import BrandModuleService from "../../../../modules/brand/service";
import { PutAdminUpdateBrand } from "../validators";

type UpdateBrandInput = z.infer<typeof PutAdminUpdateBrand>;

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

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandModuleService = req.scope.resolve(BRAND_MODULE);
  const brand = await brandModuleService.retrieveBrand(req.params.id);

  res.json({ brand });
};

export const PUT = async (
  req: MedusaRequest<UpdateBrandInput>,
  res: MedusaResponse,
) => {
  const brandModuleService: BrandModuleService =
    req.scope.resolve(BRAND_MODULE);

  await assertUniqueHandle(
    brandModuleService,
    req.validatedBody.handle,
    req.params.id,
  );

  const brand = await brandModuleService.updateBrands({
    id: req.params.id,
    ...req.validatedBody,
  });

  res.json({ brand });
};
