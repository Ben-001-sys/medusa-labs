import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

// Store endpoint to fetch the finance review for a purchase request owned by the
// authenticated customer. This intentionally only supports lookup by
// purchase_request_id (the :id param) to avoid exposing admin-only queries.
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const db = req.scope.resolve("manager") as any;

  const prRepo = db.getRepository("b2b_purchase_request");
  const pr = await prRepo.findOne({ where: { id } });

  if (!pr) {
    return res.status(404).json({ message: "purchase_request_not_found" });
  }

  // Ensure requester is the authenticated customer
  const customerId = req.user?.customer_id;
  if (!customerId || pr.customer_id !== customerId) {
    return res.status(403).json({ message: "forbidden" });
  }

  const reviewRepo = db.getRepository("b2b_order_finance_review");
  const review = await reviewRepo.findOne({
    where: { purchase_request_id: id },
  });

  if (!review) {
    return res.status(404).json({ message: "finance_review_not_found" });
  }

  res.json(review);
};
