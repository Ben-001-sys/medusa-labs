import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params;
  const db = req.scope.resolve("manager") as any;

  const prRepo = db.getRepository("b2b_purchase_request");
  const pr = await prRepo.findOne({ where: { id } });

  if (!pr)
    return res.status(404).json({ message: "purchase_request_not_found" });

  const customerId = req.user?.customer_id;
  if (!customerId || pr.customer_id !== customerId)
    return res.status(403).json({ message: "forbidden" });

  const reviewRepo = db.getRepository("b2b_order_finance_review");
  const releaseRepo = db.getRepository("b2b_order_release");

  // Try by order_id first
  let release = null;
  if (pr.order_id) {
    release = await releaseRepo.findOne({ where: { order_id: pr.order_id } });
  }

  // Fallback: find finance review by purchase_request_id
  if (!release) {
    const review = await reviewRepo.findOne({
      where: { purchase_request_id: id },
    });
    if (review) {
      release = await releaseRepo.findOne({
        where: { finance_review_id: review.id },
      });
    }
  }

  if (!release) return res.status(404).json({ message: "release_not_found" });

  res.json(release);
};
