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

type Review = {
  id: string;
  order_id: string;
  organization_id: string;
  currency_code: string;
  order_total: string;
  status: string;
  reviewed_at?: string;
};

type ListResp = {
  finance_reviews: Review[];
  count: number;
  limit: number;
  offset: number;
};

const columnHelper = createDataTableColumnHelper<Review>();

const FinanceReviewsPage = () => {
  const queryClient = useQueryClient();
  const [limit] = useState(15);
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => pagination.pageIndex * limit, [pagination]);

  const { data, isLoading } = useQuery<ListResp>({
    queryFn: () =>
      sdk.client.fetch(`/admin/b2b/finance-reviews`, {
        query: { limit, offset },
      }),
    queryKey: [["admin_b2b_finance_reviews", limit, offset]],
  });

  const columns = [
    columnHelper.accessor("order_id", { header: "Order" }),
    columnHelper.accessor("organization_id", { header: "Organization" }),
    columnHelper.accessor("currency_code", { header: "Currency" }),
    columnHelper.accessor("order_total", { header: "Order total" }),
    columnHelper.accessor("status", { header: "Status" }),
    columnHelper.accessor("reviewed_at", { header: "Reviewed" }),
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
    data: data?.finance_reviews || [],
    getRowId: (r) => r.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: { state: pagination, onPaginationChange: setPagination },
  });

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Finance Reviews</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Finance Reviews",
  icon: TagSolid,
});

export default FinanceReviewsPage;
