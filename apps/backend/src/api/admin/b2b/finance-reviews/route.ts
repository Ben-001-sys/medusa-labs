import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const db = req.scope.resolve("manager") as any;
  const repo = db.getRepository("b2b_order_finance_review");

  const limit = parseInt(String(req.query.limit || "15"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);

  const [items, count] = await repo.findAndCount({
    take: limit,
    skip: offset,
    order: { reviewed_at: "DESC" },
  });

  res.json({ finance_reviews: items, count, limit, offset });
};
