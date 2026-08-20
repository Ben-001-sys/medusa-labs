import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid } from "@medusajs/icons";
import { Button, Container, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";
import { useMemo, useState } from "react";

import {
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui";

type PR = {
  id: string;
  reference: string;
  status: string;
  created_at: string;
  draft_order_id?: string | null;
};

type ListResp = {
  purchase_requests: PR[];
  count: number;
  limit: number;
  offset: number;
};

const columnHelper = createDataTableColumnHelper<PR>();

const PurchaseRequestsPage = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<PR | null>(null);
  const limit = 15;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => pagination.pageIndex * limit, [pagination]);

  const { data, isLoading } = useQuery<ListResp>({
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/purchase-requests`, {
        query: { limit, offset },
      }),
    queryKey: [["admin_b2b_prs", limit, offset]],
  });

  const columns = [
    columnHelper.accessor("reference", { header: "Reference" }),
    columnHelper.accessor("status", { header: "Status" }),
    columnHelper.accessor("created_at", { header: "Created" }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button asChild size="small">
            <a href={`./${row.original.id}`}>Open</a>
          </Button>
        </div>
      ),
    }),
  ];

  const table = useDataTable({
    columns,
    data: data?.purchase_requests || [],
    getRowId: (r) => r.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: { state: pagination, onPaginationChange: setPagination },
  });

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Purchase Requests</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Purchase Requests",
  icon: TagSolid,
});

export default PurchaseRequestsPage;
