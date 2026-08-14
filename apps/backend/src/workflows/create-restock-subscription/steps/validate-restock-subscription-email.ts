import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";

export const validateRestockSubscriptionEmailStep = createStep(
  "validate-restock-subscription-email",
  async ({ email }: { email?: string }) => {
    const normalizedEmail = email?.trim();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A valid email address is required for a restock subscription.",
      );
    }

    return new StepResponse(normalizedEmail, normalizedEmail);
  },
  async (email) => {
    return email;
  },
);
