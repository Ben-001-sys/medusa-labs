import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";
import { Heading, Container, Table, Button, toast } from "@medusajs/ui";
import { useState } from "react";

const ExceptionsPage = () => {
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const { data: reviewsData } = useQuery({
    queryKey: ["admin_b2b_finance_reviews_exceptions"],
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/finance-reviews`, { query: { limit: 500 } }),
  });

  const { data: prsData } = useQuery({
    queryKey: ["admin_b2b_prs_exceptions"],
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/purchase-requests`, { query: { limit: 500 } }),
  });

  const decide = async (id: string, decision: string) => {
    if (!confirm(`Confirm ${decision} for ${id}?`)) return;
    setLoadingAction(id);
    try {
      await sdk.client.fetch(`/admin/b2b/finance-reviews/${id}/decision`, {
        method: "POST",
        body: { decision },
      });
      toast.success("Decision submitted");
      await queryClient.invalidateQueries({
        queryKey: [["admin_b2b_finance_reviews_exceptions"]],
      });
    } catch (e: any) {
      toast.error(e?.message || String(e));
    } finally {
      setLoadingAction(null);
    }
  };

  const releaseOrder = async (order_id: string) => {
    if (!confirm(`Trigger release for order ${order_id}?`)) return;
    setLoadingAction(order_id);
    try {
      await sdk.client.fetch(`/admin/b2b/order-releases/${order_id}/release`, {
        method: "POST",
      });
      toast.success("Release triggered");
      await queryClient.invalidateQueries({
        queryKey: [["admin_b2b_finance_reviews_exceptions"]],
      });
    } catch (e: any) {
      toast.error(e?.message || String(e));
    } finally {
      setLoadingAction(null);
    }
  };

  const forceRelease = async (order_id: string) => {
    if (!confirm(`Force release (override) for order ${order_id}?`)) return;
    setLoadingAction(order_id);
    try {
      await sdk.client.fetch(`/admin/b2b/order-releases/${order_id}/override`, {
        method: "POST",
        body: { reason: "operator_override" },
      });
      toast.success("Force release submitted");
      await queryClient.invalidateQueries({
        queryKey: [["admin_b2b_finance_reviews_exceptions"]],
      });
    } catch (e: any) {
      toast.error(e?.message || String(e));
    } finally {
      setLoadingAction(null);
    }
  };

  const reviews = (reviewsData?.finance_reviews || []) as any[];
  const prs = (prsData?.purchase_requests || []) as any[];

  // Derived exception lists (no new rules invented): we present sets and let operator act.
  const pendingReviews = reviews
    .filter((r) => r.status === "pending")
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const expiredReviews = reviews.filter((r) => r.status === "expired");
  const overdueObligations = reviews.filter(
    (r) => r.payment_terms_status === "overdue",
  );
  const eligibleReleases = reviews.filter(
    (r) =>
      r.release_status === "eligible_for_release" ||
      r.release_status === "released",
  );
  const blockedOrders = reviews.filter((r) => r.release_status === "blocked");

  return (
    <Container>
      <Heading level="h2">B2B Exceptions & Reconciliation</Heading>

      <section className="mt-6">
        <Heading level="h4">Finance reviews pending (oldest first)</Heading>
        <Table className="mt-2">
          <thead>
            <tr>
              <th>Review</th>
              <th>Order</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingReviews.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.order_id}</td>
                <td>{r.organization_id}</td>
                <td>{r.status}</td>
                <td>{r.created_at ?? r.reviewed_at ?? "—"}</td>
                <td>{r.reviewed_at ?? "—"}</td>
                <td className="flex gap-2">
                  <Button asChild size="small">
                    <a href={`/b2b/finance-reviews/${r.id}`}>Open</a>
                  </Button>
                  <Button
                    size="small"
                    onClick={() => decide(r.id, "approved_on_account")}
                    disabled={loadingAction === r.id}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    onClick={() => decide(r.id, "prepayment_required")}
                    disabled={loadingAction === r.id}
                  >
                    Require prepayment
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => decide(r.id, "rejected")}
                    disabled={loadingAction === r.id}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-6">
        <Heading level="h4">Expired finance reviews</Heading>
        <Table className="mt-2">
          <thead>
            <tr>
              <th>Review</th>
              <th>Order</th>
              <th>Organization</th>
              <th>Reason</th>
              <th>Created</th>
              <th>Last update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expiredReviews.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.order_id}</td>
                <td>{r.organization_id}</td>
                <td>{r.decision_reason_code ?? "—"}</td>
                <td>{r.created_at}</td>
                <td>{r.reviewed_at ?? "—"}</td>
                <td className="flex gap-2">
                  <Button asChild size="small">
                    <a href={`/b2b/finance-reviews/${r.id}`}>Open</a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-6">
        <Heading level="h4">Overdue payment obligations</Heading>
        <div className="text-sm mt-2 mb-2">
          Note: payment obligations listing endpoint not present; deriving from
          finance reviews where available.
        </div>
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Review</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {overdueObligations.map((r) => (
              <tr key={r.id}>
                <td>{r.order_id}</td>
                <td>{r.id}</td>
                <td>{r.organization_id}</td>
                <td>{r.payment_terms_status}</td>
                <td>{r.obligation_due_at ?? "—"}</td>
                <td>
                  <Button asChild size="small">
                    <a href={`/b2b/finance-reviews/${r.id}`}>Open</a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-6">
        <Heading level="h4">
          Eligible releases not dispatched / Blocked orders
        </Heading>
        <div className="text-sm mt-2 mb-2">
          Note: HubLoft dispatch/retry APIs are not exposed to admin; outbox
          handling is server-responsibility.
        </div>
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Review</th>
              <th>Organization</th>
              <th>Release status</th>
              <th>Last update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {eligibleReleases.map((r) => (
              <tr key={r.id}>
                <td>{r.order_id}</td>
                <td>{r.id}</td>
                <td>{r.organization_id}</td>
                <td>{r.release_status}</td>
                <td>{r.reviewed_at ?? "—"}</td>
                <td className="flex gap-2">
                  <Button asChild size="small">
                    <a href={`/b2b/finance-reviews/${r.id}`}>Open</a>
                  </Button>
                  {r.order_id ? (
                    <>
                      <Button
                        size="small"
                        onClick={() => releaseOrder(r.order_id)}
                        disabled={loadingAction === r.order_id}
                      >
                        Release
                      </Button>
                      <Button
                        variant="destructive"
                        size="small"
                        onClick={() => forceRelease(r.order_id)}
                        disabled={loadingAction === r.order_id}
                      >
                        Force release
                      </Button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-6">
        <Heading level="h4">Blocked orders (requires operator action)</Heading>
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Review</th>
              <th>Organization</th>
              <th>Blocked reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blockedOrders.map((r) => (
              <tr key={r.id}>
                <td>{r.order_id}</td>
                <td>{r.id}</td>
                <td>{r.organization_id}</td>
                <td>
                  {r.release_blocked_reason ?? r.release_blocked_note ?? "—"}
                </td>
                <td className="flex gap-2">
                  <Button asChild size="small">
                    <a href={`/b2b/finance-reviews/${r.id}`}>Open</a>
                  </Button>
                  {r.order_id ? (
                    <Button
                      variant="destructive"
                      size="small"
                      onClick={() => forceRelease(r.order_id)}
                      disabled={loadingAction === r.order_id}
                    >
                      Force release
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="mt-6">
        <Heading level="h4">HubLoft / external handoffs</Heading>
        <div className="mt-2 text-sm">
          No admin endpoints currently expose HubLoft dispatch failures or retry
          operations. These are handled by the server outbox/workflows.
        </div>
      </section>
    </Container>
  );
};

export default ExceptionsPage;
