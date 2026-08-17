import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows";

import { MedusaError, Modules } from "@medusajs/framework/utils";

import { B2B_ORGANIZATION_MODULE } from "../../modules/b2b-organization";

import B2BOrganizationModuleService from "../../modules/b2b-organization/service";

import {
  B2BOrganizationMemberStatus,
  B2BOrganizationStatus,
} from "../../modules/b2b-organization/types";

type SelectOrganizationInput = {
  cart_id: string;
  customer_id: string;
  organization_id: string;
  allowed_sales_channel_ids: string[];
};

type SelectOrganizationForCartStepContext = Awaited<
  ReturnType<B2BOrganizationModuleService["listB2BCartContexts"]>
>[number];

type SelectOrganizationForCartStepOutput = {
  context: SelectOrganizationForCartStepContext;
  action: "already_selected" | "selected";
};

type SelectOrganizationForCartStepCompensationInput = {
  created_context_id: string;
};

const selectOrganizationForCartStep = createStep<
  SelectOrganizationInput,
  SelectOrganizationForCartStepOutput,
  SelectOrganizationForCartStepCompensationInput
>(
  "select-b2b-organization-for-cart",
  async (input: SelectOrganizationInput, { container }) => {
    const cartModuleService = container.resolve(Modules.CART);

    const b2bService = container.resolve<B2BOrganizationModuleService>(
      B2B_ORGANIZATION_MODULE,
    );

    const cart = await cartModuleService.retrieveCart(input.cart_id);

    if (cart.customer_id !== input.customer_id) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "This cart does not belong to the authenticated customer.",
      );
    }

    const organizations = await b2bService.listB2BOrganizations({
      id: input.organization_id,
      status: B2BOrganizationStatus.ACTIVE,
    });

    const organization = organizations[0];

    if (!organization) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Active B2B organization was not found.",
      );
    }

    if (
      !input.allowed_sales_channel_ids.includes(organization.sales_channel_id)
    ) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "This organization is unavailable in this storefront.",
      );
    }

    if (cart.sales_channel_id !== organization.sales_channel_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cart sales channel does not match this organization.",
      );
    }

    const members = await b2bService.listB2BOrganizationMembers({
      organization_id: organization.id,
      customer_id: input.customer_id,
      status: B2BOrganizationMemberStatus.ACTIVE,
    });

    const member = members[0];

    if (!member) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You are not an active member of this organization.",
      );
    }

    const existingContexts = await b2bService.listB2BCartContexts({
      cart_id: cart.id,
    });

    const existingContext = existingContexts[0];

    if (existingContext) {
      if (
        existingContext.organization_id === organization.id &&
        existingContext.customer_id === input.customer_id
      ) {
        return new StepResponse<
          SelectOrganizationForCartStepOutput,
          SelectOrganizationForCartStepCompensationInput
        >({
          context: existingContext,
          action: "already_selected",
        });
      }

      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This cart is already assigned to another organization.",
      );
    }

    const context = await b2bService.createB2BCartContexts({
      cart_id: cart.id,
      customer_id: input.customer_id,
      organization_id: organization.id,
      member_id: member.id,
    });

    return new StepResponse<
      SelectOrganizationForCartStepOutput,
      SelectOrganizationForCartStepCompensationInput
    >(
      {
        context,
        action: "selected",
      },
      {
        created_context_id: context.id,
      },
    );
  },

  async (
    compensationData:
      | SelectOrganizationForCartStepCompensationInput
      | undefined,
    { container },
  ) => {
    if (!compensationData?.created_context_id) {
      return;
    }

    const b2bService = container.resolve<B2BOrganizationModuleService>(
      B2B_ORGANIZATION_MODULE,
    );

    await b2bService.deleteB2BCartContexts(compensationData.created_context_id);
  },
);

export const selectOrganizationForCartWorkflow = createWorkflow(
  "select-b2b-organization-for-cart",
  (input: SelectOrganizationInput) => {
    // Matches the raw cart-ID lock key used by Medusa cart workflows.
    acquireLockStep({
      key: input.cart_id,
      timeout: 10,
      ttl: 60,
    });

    const result = selectOrganizationForCartStep(input);

    releaseLockStep({
      key: input.cart_id,
    });

    return new WorkflowResponse(result);
  },
);
