import { useQuery } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";
import { Table, Heading, Container } from "@medusajs/ui";

type Event = {
  id: string;
  action: string;
  actor_display?: string | null;
  actor_type?: string | null;
  occurred_at: string;
  reason_code?: string | null;
  note?: string | null;
  correlation_id?: string | null;
  causation_id?: string | null;
};

const B2BAuditTimeline = ({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_b2b_audit", entityType, entityId],
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/audit`, {
        query: { entity_type: entityType, entity_id: entityId, limit: 200 },
      }),
  });

  if (isLoading) return <div>Loading audit…</div>;
  if (!data || !data.audit_events || data.audit_events.length === 0)
    return <div>No audit activity found.</div>;

  return (
    <Container className="mt-6">
      <Heading level="h3">Activity</Heading>
      <Table className="mt-2">
        <thead>
          <tr>
            <th>Event</th>
            <th>Actor</th>
            <th>When</th>
            <th>Reason</th>
            <th>Note</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          {data.audit_events.map((e: Event) => (
            <tr key={e.id}>
              <td>{e.action}</td>
              <td>{e.actor_display ?? e.actor_type ?? "service"}</td>
              <td>{new Date(e.occurred_at).toLocaleString()}</td>
              <td>{e.reason_code ?? "—"}</td>
              <td>{e.note ?? "—"}</td>
              <td>{e.correlation_id ?? e.causation_id ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default B2BAuditTimeline;
