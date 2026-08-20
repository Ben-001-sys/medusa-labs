import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { z } from "@medusajs/framework/zod";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const db = req.scope.resolve("manager") as any;
  const repo = db.getRepository("b2b_purchase_request");

  const limit = parseInt(String(req.query.limit || "15"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);

  const [items, count] = await repo.findAndCount({
    take: limit,
    skip: offset,
    order: { created_at: "DESC" },
  });

  res.json({ purchase_requests: items, count, limit, offset });
};
