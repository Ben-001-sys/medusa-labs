import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../../lib/sdk";
import { Heading, Button, Container, toast } from "@medusajs/ui";
import { useState } from "react";
import B2BAuditTimeline from "../../components/B2BAuditTimeline";

const DetailPage = ({ params }: { params: { id: string } }) => {
  const queryClient = useQueryClient();
  const { id } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["admin_b2b_pr", id],
    queryFn: () => sdk.client.fetch(`/admin/b2b/purchase-requests/${id}`),
  });

  const { mutateAsync: decide, isPending } = useMutation({
    mutationFn: (payload: { decision: "approved" | "rejected" }) =>
      sdk.client.fetch(`/admin/b2b/purchase-requests/${id}/decision`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [["admin_b2b_prs"]] });
      toast.success("Decision submitted");
      window.location.assign("/b2b/purchase-requests");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : String(e));
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Container>
      <Heading level="h2">Purchase Request {data?.id}</Heading>
      <div className="mt-4">
        <p>Reference: {data?.reference}</p>
        <p>Status: {data?.status}</p>
        <p>Created: {data?.created_at}</p>
        {data?.draft_order_id ? (
          <div className="mt-2">
            <a
              href={`/admin/orders/${data.draft_order_id}/edit`}
              className="text-blue-600"
            >
              Open Draft Order
            </a>
          </div>
        ) : null}
      </div>
      <div className="mt-6 flex gap-2">
        <Button
          variant="danger"
          onClick={() => decide({ decision: "rejected" })}
          disabled={isPending}
        >
          Reject
        </Button>
        <Button
          onClick={() => decide({ decision: "approved" })}
          disabled={isPending}
        >
          Send Offer
        </Button>
      </div>

      <B2BAuditTimeline entityType="purchase_request" entityId={data?.id} />
    </Container>
  );
};

export default DetailPage;
