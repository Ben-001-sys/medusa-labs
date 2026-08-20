import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "zod";

const bodySchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().optional(),
});

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "invalid_body", errors: parsed.error.format() });
  }

  const { decision, note } = parsed.data;

  const workflowService = req.scope.resolve("workflowService") as any;

  try {
    const result = await workflowService
      .withTransaction(async (manager) => {
        return await workflowService.run("decideB2BPurchaseRequestWorkflow", {
          purchase_request_id: id,
          decision: decision === "approved" ? "approved" : "rejected",
          note,
          approver_customer_id: req.user?.customer_id || null,
        });
      })
      .catch((e) => {
        throw e;
      });

    return res.json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err instanceof Error ? err.message : String(err) });
  }
};
