import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const db = req.scope.resolve("manager") as any;
  const repo = db.getRepository("b2b_audit_event");

  const limit = parseInt(String(req.query.limit || "25"), 10);
  const offset = parseInt(String(req.query.offset || "0"), 10);

  const where: Record<string, unknown> = {};

  if (req.query.entity_type) where.entity_type = String(req.query.entity_type);
  if (req.query.entity_id) where.entity_id = String(req.query.entity_id);
  if (req.query.organization_id)
    where.organization_id = String(req.query.organization_id);

  const [items, count] = await repo.findAndCount({
    where,
    order: { occurred_at: "DESC" },
    take: limit,
    skip: offset,
  });

  res.json({ audit_events: items, count, limit, offset });
};
