import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid } from "@medusajs/icons";
import { Button, Container, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../lib/sdk";
import { useMemo, useState } from "react";

import {
  // ...
  Heading,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  useDataTable,
} from "@medusajs/ui";

type Brand = {
  id: string;
  name: string;
};
type BrandsResponse = {
  brands: Brand[];
  count: number;
  limit: number;
  offset: number;
};
const columnHelper = createDataTableColumnHelper<Brand>();

const BrandsPage = () => {
  const queryClient = useQueryClient();
  const navigateTo = (path: string) => {
    window.location.assign(path);
  };
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => navigateTo(`/brands/edit/${row.original.id}`)}>
            Edit
          </Button>
          <Button size="small" variant="secondary" onClick={() => setBrandToDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    }),
  ];
  const limit = 15;
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });
  const offset = useMemo(() => {
    return pagination.pageIndex * limit;
  }, [pagination]);

  const { data, isLoading } = useQuery<BrandsResponse>({
    queryFn: () =>
      sdk.client.fetch(`/admin/brands`, {
        query: {
          limit,
          offset,
        },
      }),
    queryKey: [["brands", limit, offset]],
  });

  const { mutateAsync: deleteBrand, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/brands/${id}`, {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      setBrandToDelete(null);
      toast.success("Brand deleted successfully");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unable to delete brand";
      toast.error(message);
    },
  });

  const table = useDataTable({
    columns,
    data: data?.brands || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  return (
    <Container className="divide-y p-0">
      {brandToDelete ? (
        <div className="border-b p-6">
          <Heading level="h2">Delete brand?</Heading>
          <p className="mt-2">Are you sure you want to delete {brandToDelete.name}?</p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setBrandToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteBrand(brandToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      ) : null}
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Brands</Heading>
          <Button onClick={() => navigateTo("/brands/create")}>Create Brand</Button>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Brands",
  icon: TagSolid,
});

export default BrandsPage;
