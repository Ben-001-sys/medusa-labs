import { z } from "@medusajs/framework/zod";

export const brandHandleSchema = z
  .string()
  .trim()
  .min(1, "Handle is required")
  .max(100, "Handle must be 100 characters or less")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Handle must contain only lowercase letters, numbers, and hyphens",
  );

export const PostAdminCreateBrand = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be 100 chars or less"),
  handle: brandHandleSchema,
});

export const PutAdminUpdateBrand = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name must be 100 chars or less"),
  handle: brandHandleSchema,
});
