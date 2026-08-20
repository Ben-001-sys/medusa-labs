import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk";
import { Heading, Button, Container, toast } from "@medusajs/ui";
import B2BAuditTimeline from "../../components/B2BAuditTimeline";
import { useState } from "react";

const DetailPage = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const { id } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["admin_b2b_finance_review", id],
    queryFn: () => sdk.client.fetch(`/admin/b2b/finance-reviews/${id}`),
  });

  const [decisioning, setDecisioning] = useState(false);

  const decide = async (
    decision: "approved_on_account" | "prepayment_required" | "rejected",
  ) => {
    const reason =
      prompt(`Reason code (required for sensitive actions):`) || undefined;
    const note = prompt("Note (optional):") || undefined;
    if (!reason && decision !== "rejected") {
      alert("Reason code is recommended for approvals/prepayments.");
    }
    if (!confirm(`Confirm ${decision} by current operator?`)) return;
    setDecisioning(true);
    try {
      const res = await sdk.client.fetch(
        `/admin/b2b/finance-reviews/${id}/decision`,
        {
          method: "POST",
          body: { decision, reason_code: reason, note },
        },
      );
      toast.success("Decision submitted");
      await queryClient.invalidateQueries({
        queryKey: [["admin_b2b_finance_reviews"]],
      });
      setDecisioning(false);
      window.location.assign("/b2b/finance-reviews");
    } catch (e: any) {
      setDecisioning(false);
      toast.error(e?.message || String(e));
    }
  };

  const releaseOrder = async () => {
    if (!data.order_id) return alert("No order associated with this review");
    if (!confirm(`Release order ${data.order_id} to warehouse?`)) return;
    try {
      const res = await sdk.client.fetch(
        `/admin/b2b/order-releases/${data.order_id}/release`,
        { method: "POST" },
      );
      toast.success("Release triggered");
      await queryClient.invalidateQueries({
        queryKey: [["admin_b2b_finance_reviews"]],
      });
      window.location.assign("/b2b/finance-reviews");
    } catch (e: any) {
      toast.error(e?.message || String(e));
    }
  };

  const forceRelease = async () => {
    if (!data.order_id) return alert("No order associated with this review");
    const reason = prompt("Override reason (optional):") || undefined;
    if (
      !confirm(
        `Force release order ${data.order_id}? This requires release_override authority.`,
      )
    )
      return;
    try {
      const res = await sdk.client.fetch(
        `/admin/b2b/order-releases/${data.order_id}/override`,
        { method: "POST", body: { reason } },
      );
      toast.success("Force release submitted");
      await queryClient.invalidateQueries({
        queryKey: [["admin_b2b_finance_reviews"]],
      });
      window.location.assign("/b2b/finance-reviews");
    } catch (e: any) {
      toast.error(e?.message || String(e));
    }
  };

  if (isLoading) return <div>Loading…</div>;
  if (!data) return <div>Not found</div>;

  return (
    <Container>
      <Heading level="h2">Finance Review {data.id}</Heading>
      <div className="mt-4 space-y-2 text-sm">
        <div>Order: {data.order_id}</div>
        <div>Organization: {data.organization_id}</div>
        <div>Customer: {data.decision_by_admin_user_id ?? "—"}</div>
        <div>Currency: {data.currency_code}</div>
        <div>
          Order total: {data.order_total} {data.currency_code}
        </div>
        <div>Finance account: {data.finance_account_id ?? "—"}</div>
        <div>Payment terms: {data.payment_terms_code ?? "—"}</div>
        <div>Review status: {data.status}</div>
        <div>Release status: {data.release_status ?? "—"}</div>
        <div>Credit-hold ref: {data.external_credit_hold_id ?? "—"}</div>
        <div>Invoice ref: {data.external_invoice_id ?? "—"}</div>
        <div>Reviewer: {data.decision_by_admin_user_id ?? "—"}</div>
        <div>Reason: {data.decision_reason_code ?? "—"}</div>
        <div>Note: {data.decision_note ?? "—"}</div>
        <div>Reviewed at: {data.reviewed_at ?? "—"}</div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          variant="danger"
          onClick={() => decide("rejected")}
          disabled={decisioning}
        >
          Reject
        </Button>
        <Button
          onClick={() => decide("prepayment_required")}
          disabled={decisioning}
        >
          Require prepayment
        </Button>
        <Button
          onClick={() => decide("approved_on_account")}
          disabled={decisioning}
        >
          Approve on account
        </Button>
        <Button onClick={releaseOrder} variant="secondary">
          Release to warehouse
        </Button>
        <Button onClick={forceRelease} variant="destructive">
          Force release (override)
        </Button>
      </div>

      <B2BAuditTimeline entityType="finance_review" entityId={data.id} />
    </Container>
  );
};

export default DetailPage;
