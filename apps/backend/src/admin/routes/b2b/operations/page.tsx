import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Heading, Container, Button } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";

const OperationsPage = () => {
  // We will compose existing admin endpoints client-side to aggregate stats.

  const orgs = useQuery({
    queryKey: ["admin_b2b_orgs"],
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/organizations`, { query: { limit: 100 } }),
  });

  const prs = useQuery({
    queryKey: ["admin_b2b_prs_dashboard"],
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/purchase-requests`, { query: { limit: 200 } }),
  });

  const reviews = useQuery({
    queryKey: ["admin_b2b_finance_reviews_dashboard"],
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/finance-reviews`, { query: { limit: 200 } }),
  });

  const orgsData = orgs.data || { organizations: [] };
  const prsData = prs.data || { purchase_requests: [] };
  const reviewsData = reviews.data || { finance_reviews: [] };

  return (
    <Container>
      <Heading level="h2">B2B Operations Dashboard</Heading>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-ui-bg-base rounded-md p-4">
          <Heading level="h4">Organizations</Heading>
          <div className="mt-2 text-sm">
            <div>
              Active:{" "}
              {
                orgsData.organizations.filter((o: any) => o.status === "active")
                  .length
              }
            </div>
            <div>
              Pending:{" "}
              {
                orgsData.organizations.filter(
                  (o: any) => o.status === "pending",
                ).length
              }
            </div>
            <div>
              Suspended:{" "}
              {
                orgsData.organizations.filter(
                  (o: any) => o.status === "suspended",
                ).length
              }
            </div>
          </div>
          <div className="mt-3">
            <Button asChild>
              <a href="/b2b/organizations">Open</a>
            </Button>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md p-4">
          <Heading level="h4">Purchase Requests</Heading>
          <div className="mt-2 text-sm">
            <div>
              Awaiting approval:{" "}
              {
                prsData.purchase_requests.filter(
                  (p: any) => p.status === "pending_internal_approval",
                ).length
              }
            </div>
            <div>
              Awaiting merchant quote:{" "}
              {
                prsData.purchase_requests.filter(
                  (p: any) => p.status === "pending_merchant_quote",
                ).length
              }
            </div>
            <div>
              Awaiting buyer acceptance:{" "}
              {
                prsData.purchase_requests.filter(
                  (p: any) => p.status === "pending_buyer_acceptance",
                ).length
              }
            </div>
            <div>
              Expired:{" "}
              {
                prsData.purchase_requests.filter(
                  (p: any) => p.status === "expired",
                ).length
              }
            </div>
            <div>
              Rejected:{" "}
              {
                prsData.purchase_requests.filter(
                  (p: any) => p.status === "rejected",
                ).length
              }
            </div>
          </div>
          <div className="mt-3">
            <Button asChild>
              <a href="/b2b/purchase-requests">Open</a>
            </Button>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md p-4">
          <Heading level="h4">Finance</Heading>
          <div className="mt-2 text-sm">
            <div>
              Pending review:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.status === "pending",
                ).length
              }
            </div>
            <div>
              Prepayment required:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.status === "prepayment_required",
                ).length
              }
            </div>
            <div>
              Approved on account:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) =>
                    r.status === "approved_on_account" ||
                    r.status === "approved",
                ).length
              }
            </div>
            <div>
              Rejected:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.status === "rejected",
                ).length
              }
            </div>
            <div>
              Overdue obligations:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.payment_terms_status === "overdue",
                ).length
              }
            </div>
          </div>
          <div className="mt-3">
            <Button asChild>
              <a href="/b2b/finance-reviews">Open</a>
            </Button>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md p-4">
          <Heading level="h4">Warehouse</Heading>
          <div className="mt-2 text-sm">
            <div>
              Finance pending:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.release_status === "finance_pending",
                ).length
              }
            </div>
            <div>
              Eligible for release:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.release_status === "eligible_for_release",
                ).length
              }
            </div>
            <div>
              Blocked:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.release_status === "blocked",
                ).length
              }
            </div>
            <div>
              Released:{" "}
              {
                reviewsData.finance_reviews.filter(
                  (r: any) => r.release_status === "released",
                ).length
              }
            </div>
            <div>HubLoft dispatch pending: N/A (handled by backend outbox)</div>
          </div>
          <div className="mt-3">
            <Button asChild>
              <a href="/b2b/finance-reviews">Open</a>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "B2B Operations",
  icon: undefined,
});

export default OperationsPage;
