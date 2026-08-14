import { z } from "@medusajs/framework/zod"

export const PimProductRevisionSchema = z
  .object({
    schema_version: z.literal("1.0"),

    source: z.string().min(1).max(80),

    event_id: z.string().min(1).max(160),

    event_type: z.literal("product.upsert"),

    occurred_at: z.string().datetime({ offset: true }),

    product: z.object({
      external_id: z.string().min(1).max(160),

      revision: z.number().int().positive(),

      title: z.string().min(1).max(255),

      handle: z
        .string()
        .min(3)
        .max(255)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

      description: z.string().max(20_000).nullable().optional(),
    }),
  })
  .strict()

export type PimProductRevision = z.infer<
  typeof PimProductRevisionSchema
>