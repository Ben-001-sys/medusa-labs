import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid } from "@medusajs/icons";
import { Button, Container, Heading, Input, Label, toast } from "@medusajs/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../../../lib/sdk";

type BrandResponse = {
  brand: {
    id: string;
    name: string;
  };
};

const schema = zod.object({
  name: zod
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be 100 characters or less"),
});

const BrandCreatePage = () => {
  const queryClient = useQueryClient();
  const navigateTo = (path: string) => {
    window.location.assign(path);
  };

  const form = useForm<zod.infer<typeof schema>>({
    defaultValues: {
      name: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: zod.infer<typeof schema>) =>
      sdk.client.fetch<BrandResponse>("/admin/brands", {
        method: "POST",
        body: payload,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand created successfully");
      form.reset({ name: "" });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to create brand";

      toast.error(message);
    },
  });

  const handleSubmit = form.handleSubmit((formData) => mutateAsync(formData));

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Button type="button" onClick={() => navigateTo("/brands")}>
            Back
          </Button>
          <Heading level="h1">Create Brand</Heading>
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              Create Brand
            </Button>
            <Button type="button" onClick={() => form.reset({ name: "" })}>
              Clear
            </Button>
          </div>
        </form>
      </FormProvider>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Create Brand",
  icon: TagSolid,
});

export default BrandCreatePage;
