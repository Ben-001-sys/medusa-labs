import { InferTypeOf } from "@medusajs/framework/types";
import RestockSubscription from "../../../modules/restock/models/restock-subscription";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import RestockModuleService from "../../../modules/restock/service";
import { RESTOCK_MODULE } from "../../../modules/restock";

type DeleteRestockSubscriptionsStepInput = InferTypeOf<
  typeof RestockSubscription
>[];

export const deleteRestockSubscriptionStep = createStep(
  "delete-restock-subscription",
  async (
    restockSubscriptions: DeleteRestockSubscriptionsStepInput,
    { container },
  ) => {
    const restockModuleService: RestockModuleService =
      container.resolve(RESTOCK_MODULE);
    const logger = container.resolve("logger");

    const ids = restockSubscriptions.map((subscription) => subscription.id);

    try {
      await restockModuleService.deleteRestockSubscriptions(ids);
      logger.info(
        `[delete-restock-subscription] deleted=${ids.length} ids=${ids.join(",")}`,
      );
    } catch (err) {
      logger.error(
        `[delete-restock-subscription] failed to delete subscriptions: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }

    return new StepResponse(undefined, restockSubscriptions);
  },
  async (restockSubscriptions, { container }) => {
    if (!restockSubscriptions) {
      return;
    }

    const restockModuleService: RestockModuleService =
      container.resolve(RESTOCK_MODULE);

    await restockModuleService.createRestockSubscriptions(restockSubscriptions);
  },
);
