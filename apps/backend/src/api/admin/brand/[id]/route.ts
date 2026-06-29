import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import { BRAND_MODULE } from "../../../../modules/brand";

const UpdateBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be 100 characters or less"),
});

type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const brandModuleService = req.scope.resolve(BRAND_MODULE);
  const brand = await brandModuleService.retrieveBrand(req.params.id);

  res.json({ brand });
};

export const PUT = async (
  req: MedusaRequest<UpdateBrandInput>,
  res: MedusaResponse,
) => {
  const brandModuleService = req.scope.resolve(BRAND_MODULE);
  const brand = await brandModuleService.updateBrands({
    id: req.params.id,
    ...req.validatedBody,
  });

  res.json({ brand });
};
