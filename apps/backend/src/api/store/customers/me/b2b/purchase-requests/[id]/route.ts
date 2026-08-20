import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const db = req.scope.resolve("manager") as any;
  const repo = db.getRepository("b2b_purchase_request");

  const pr = await repo.findOne({ where: { id }, relations: ["approvals"] });

  if (!pr) {
    return res.status(404).json({ message: "not_found" });
  }

  // Ensure requester is the authenticated customer
  const customerId = req.user?.customer_id;
  if (!customerId || pr.customer_id !== customerId) {
    return res.status(403).json({ message: "forbidden" });
  }

  res.json(pr);
};
