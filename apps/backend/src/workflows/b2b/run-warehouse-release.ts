import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";

import { createWarehouseReleaseOutboxStep } from "./steps/create-warehouse-release-outbox";

type Input = {
  order_id: string;
  admin_user_id?: string;
};

export const runB2BWarehouseReleaseWorkflow = createWorkflow(
  "run-b2b-warehouse-release",
  (input: Input) => {
    const result = createWarehouseReleaseOutboxStep({
      order_id: input.order_id,
    });

    return new WorkflowResponse(result);
  },
);

export default runB2BWarehouseReleaseWorkflow;
