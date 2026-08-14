import { MedusaContainer } from "@medusajs/framework/types";
import { sendRestockNotificationsWorkflow } from "../workflows/send-restock-notifications";

export default async function myCustomJob(container: MedusaContainer) {
  const logger = container.resolve("logger");

  logger.info(
    `[check-restock] job started - dev contact: hotorben001@gmail.com`,
  );

  try {
    await sendRestockNotificationsWorkflow(container).run();
    logger.info(`[check-restock] job finished`);
  } catch (err) {
    logger.error(
      `[check-restock] job failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export const config = {
  name: "check-restock",
  schedule: "* * * * *", // For debugging, change to `* * * * *`
};
