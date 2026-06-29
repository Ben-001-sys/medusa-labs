import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import {
  Button,
  Container,
  Heading,
  Label,
  Select,
  Text,
  toast,
} from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { sdk } from "../lib/sdk";

type BrandOption = {
  id: string;
  name: string;
};

type BrandListResponse = {
  brands: BrandOption[];
};

type AdminProductBrand = AdminProduct & {
  brand?: BrandOption;
};

const NO_BRAND_VALUE = "__no_brand__";

const ProductBrandSelectorWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  const queryClient = useQueryClient();
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>(
    undefined,
  );

  const { data: brandsData, isLoading: isBrandsLoading } =
    useQuery<BrandListResponse>({
      queryKey: ["brands", "list"],
      queryFn: () =>
        sdk.client.fetch<BrandListResponse>("/admin/brands", {
          query: {
            limit: 100,
            offset: 0,
          },
        }),
    });

  const { data: productData } = useQuery({
    queryKey: ["product", product.id, "brand"],
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields: "+brand.*",
      }),
    enabled: !!product.id,
  });

  const currentBrandId = useMemo(() => {
    return (productData?.product as AdminProductBrand)?.brand?.id || undefined;
  }, [productData]);

  const options = useMemo(() => {
    return (brandsData?.brands || []).map((brand) => ({
      label: brand.name,
      value: brand.id,
    }));
  }, [brandsData]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (brandId?: string) => {
      const payload = {
        additional_data: {
          brand_id: brandId ?? undefined,
        },
      };

      return sdk.admin.product.update(product.id, payload as any);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["product", product.id, "brand"],
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Brand updated successfully");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to update brand";
      toast.error(message);
    },
  });

  const handleSave = async () => {
    await mutateAsync(selectedBrandId ?? currentBrandId);
  };

  const selectValue = selectedBrandId ?? currentBrandId ?? NO_BRAND_VALUE;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Brand</Heading>
      </div>
      <div className="flex flex-col gap-3 px-6 py-4">
        <Label size="small" weight="plus">
          Select brand
        </Label>
        <Select
          value={selectValue}
          onValueChange={(value) =>
            setSelectedBrandId(value === NO_BRAND_VALUE ? undefined : value)
          }
          disabled={isBrandsLoading || isPending}
        >
          <Select.Trigger>
            <Select.Value placeholder="Select a brand" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={NO_BRAND_VALUE}>No brand</Select.Item>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Text size="small" className="text-ui-fg-subtle">
          Choose a brand for this product.
        </Text>
        <Button onClick={handleSave} disabled={isPending || isBrandsLoading}>
          {isPending ? "Saving..." : "Save brand"}
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductBrandSelectorWidget;
