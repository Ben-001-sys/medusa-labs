import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { runB2BWarehouseReleaseWorkflow } from "../../../../../../workflows/b2b/run-warehouse-release";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const { order_id } = req.params as { order_id: string };

  const { result } = await runB2BWarehouseReleaseWorkflow(req.scope).run({
    input: {
      order_id,
      admin_user_id: req.auth_context.actor_id,
    },
  });

  res.status(200).json(result);
};
