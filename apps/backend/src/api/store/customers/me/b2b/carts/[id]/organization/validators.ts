import { z } from "@medusajs/framework/zod"

export const PostSelectB2BOrganization = z.object({
  organization_id: z.string().min(1),
})