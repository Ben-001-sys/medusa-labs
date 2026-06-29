import { z } from "@medusajs/framework/zod";

export const PostAdminCreateBrand = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Brand name is required")
        .max(100, "Brand name must be 100 chars or less")
})