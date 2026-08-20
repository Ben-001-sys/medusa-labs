import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const db = req.scope.resolve("manager") as any;
  const repo = db.getRepository("b2b_order_finance_review");

  const review = await repo.findOne({ where: { id } });

  if (!review) return res.status(404).json({ message: "not_found" });

  res.json(review);
};
