import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { BRAND_MODULE } from "../modules/brand";
import BrandModuleService from "../modules/brand/service";

export type CreateBrandStepInput = {
  name: string;
  handle: string;
};

export const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandStepInput, { container }) => {
    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    const name = input?.name?.trim();
    const handle = input?.handle?.trim();

    if (!name || !handle) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Brand name and handle are required.",
      );
    }

    const brand = await brandModuleService.createBrands({
      name,
      handle,
    });

    return new StepResponse(brand, brand.id);
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return;
    }

    const brandModuleService: BrandModuleService =
      container.resolve(BRAND_MODULE);

    await brandModuleService.deleteBrands(id);
  },
);

type CreateBrandWorkflowInput = {
  name: string;
  handle: string;
};

export const createBrandWorkflow = createWorkflow(
  "create-brand",
  (input: CreateBrandWorkflowInput) => {
    const brand = createBrandStep(input);

    return new WorkflowResponse(brand);
  },
);
