import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;

  const customerId = req.user?.customer_id;
  if (!customerId) {
    return res.status(401).json({ message: "unauthenticated" });
  }

  const workflowService = req.scope.resolve("workflowService") as any;

  try {
    const result = await workflowService.run(
      "acceptB2BPurchaseRequestWorkflow",
      {
        purchase_request_id: id,
        customer_id: customerId,
      },
    );

    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(400).json({ message });
  }
};
