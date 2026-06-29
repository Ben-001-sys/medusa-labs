import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid } from "@medusajs/icons";
import { Button, Container, Heading, Input, Label, toast } from "@medusajs/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import * as zod from "zod";
import { sdk } from "../../../../lib/sdk";

type Brand = {
  id: string;
  name: string;
};

type BrandResponse = {
  brand: Brand;
};

const schema = zod.object({
  name: zod
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be 100 characters or less"),
});

const BrandEditPage = () => {
  const queryClient = useQueryClient();
  const navigateTo = (path: string) => {
    window.location.assign(path);
  };
  const { id } = useParams<{ id: string }>();

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: "",
    },
  });

  const { data, isLoading, isError } = useQuery<BrandResponse>({
    queryKey: ["brands", id],
    queryFn: () => sdk.client.fetch<BrandResponse>(`/admin/brands/${id}`),
    enabled: !!id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: zod.infer<typeof schema>) =>
      sdk.client.fetch<BrandResponse>(`/admin/brands/${id}`, {
        method: "PUT",
        body: payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand updated successfully");
      navigateTo("/brands");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to update brand";

      toast.error(message);
    },
  });

  const handleSubmit = form.handleSubmit((formData) => mutateAsync(formData));

  if (isLoading) {
    return (
      <Container className="p-6">
        <Heading level="h1">Loading brand...</Heading>
      </Container>
    );
  }

  if (isError || !data?.brand) {
    return (
      <Container className="p-6">
        <Heading level="h1">Unable to load brand</Heading>
      </Container>
    );
  }

  if (data.brand.name !== form.getValues("name")) {
    form.reset({ name: data.brand.name });
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => navigateTo("/brands")}>
            Back
          </Button>
          <Heading level="h1">Edit Brand</Heading>
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-2">
                <Label size="small" weight="plus">
                  Name
                </Label>
                <Input {...field} placeholder="Enter brand name" />
                {fieldState.error?.message ? (
                  <p className="text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </FormProvider>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Edit Brand",
  icon: TagSolid,
});

export default BrandEditPage;
