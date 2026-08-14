import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
  authenticate,
  MedusaRequest, 
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod"
import { createFindParams } from "@medusajs/medusa/api/utils/validators"
import { Modules } from "@medusajs/framework/utils";
import { PostAdminCreateBrand, PutAdminUpdateBrand } from "./admin/brands/validators";
import { PostSelectDeliverySlot } from "./store/customers/me/carts/[id]/delivery-slot/validators";
import {
  PimProductRevisionSchema,
} from "../modules/pim-connector/contracts"
import { 
  PostStoreCreateRestockSubscription,
} from "./store/restock-subscriptions/validators"

export const GetBrandsSchema = createFindParams()

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/brands",
      method: "POST",
      middlewares: [
        validateAndTransformBody(PostAdminCreateBrand),
      ],
    },
    {
      matcher: "/admin/brands/:id",
      method: "PUT",
      middlewares: [validateAndTransformBody(PutAdminUpdateBrand)],
    },
    {
      matcher: "/admin/products",
      method: ["POST"],
      additionalDataValidator: {
        brand_id: z.string().optional(),
      },
    },
    {
      matcher: "/admin/brands",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          GetBrandsSchema,
          {
            defaults: [
              "id",
              "name",
              "handle",
              "products.*",
            ],
            isList: true,
          }
        ),
      ],
    },
    {
      matcher: "/store/customers/me/carts/:id/delivery-slot",
      methods: ["POST"],
      middlewares: [
        validateAndTransformBody(PostSelectDeliverySlot),
      ],
    },
    {
      matcher: "/integrations/pim/product-revisions",
      method: ["POST"],
      middlewares: [
        validateAndTransformBody(PimProductRevisionSchema),
      ],
    },
    {
      matcher: "/store/restock-subscriptions",
      method: "POST",
      middlewares: [
        authenticate("customer", ["bearer", "session"], {
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(PostStoreCreateRestockSubscription),
      ],
    },
  ],
});
