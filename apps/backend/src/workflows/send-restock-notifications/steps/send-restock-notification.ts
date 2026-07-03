import { createStep } from "@medusajs/framework/workflows-sdk";
import { InferTypeOf, ProductVariantDTO } from "@medusajs/framework/types";
import RestockSubscription from "../../../modules/restock/models/restock-subscription";

type RestockVariantData = Partial<ProductVariantDTO> & {
  product_title?: string;
  variant_title?: string;
  product_handle?: string;
  product_url?: string;
  thumbnail?: string;
  images?: Array<{ url?: string }>;
  product?: Partial<ProductVariantDTO> & {
    title?: string;
    handle?: string;
    thumbnail?: string;
    images?: Array<{ url?: string }>;
    currency_code?: string;
  };
  prices?: Array<{
    amount?: number | string;
    value?: number | string;
    currency_code?: string;
  }>;
  unit_price?: number | string;
  calculated_price?: number | string;
  currency_code?: string;
};

type SendRestockNotificationStepInput = (InferTypeOf<
  typeof RestockSubscription
> & {
  product_variant?: RestockVariantData;
})[];

export const sendRestockNotificationStep = createStep(
  "send-restock-notification",
  async (input: SendRestockNotificationStepInput, { container }) => {
    const notificationModuleService = container.resolve("notification");
    const logger = container.resolve("logger");

    logger.info(
      `[send-restock-notification] restocked_subscriptions=${input?.length ?? 0}`,
    );

    const notificationData = input.map((subscription) => {
      const v = subscription.product_variant || {};

      const productTitle = v.product_title || v.product?.title || "";
      const variantTitle = v.variant_title || v.title || "";
      const productImage =
        v.thumbnail ||
        (v.images && v.images[0] && v.images[0].url) ||
        v.product?.thumbnail ||
        (v.product?.images && v.product.images[0] && v.product.images[0].url) ||
        "";

      const priceAmount =
        (v.prices &&
          v.prices[0] &&
          (v.prices[0].amount ?? v.prices[0].value)) ||
        v.unit_price ||
        v.calculated_price;
      const currencyCode =
        (v.prices && v.prices[0] && v.prices[0].currency_code) ||
        v.currency_code ||
        v.product?.currency_code ||
        "";

      let formattedPrice = "";
      try {
        if (priceAmount != null) {
          const num =
            typeof priceAmount === "string"
              ? parseFloat(priceAmount)
              : priceAmount;
          formattedPrice = new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currencyCode || "USD",
          }).format(num);
        }
      } catch (e) {
        formattedPrice = String(priceAmount);
      }

      const productHandle = v.product_handle || v.product?.handle || "";
      const storefrontBase = (process.env.STOREFRONT_URL || "").replace(
        /\/+$/,
        "",
      );
      let productUrl = v.product_url;
      if (!productUrl && productHandle) {
        productUrl = storefrontBase
          ? `${storefrontBase}/products/${productHandle}`
          : `/products/${productHandle}`;
      }

      return {
        to: subscription.email,
        channel: "email",
        template: "variant-restock",
        data: {
          productTitle,
          variantTitle,
          productImage,
          formattedPrice,
          currencyCode,
          productHandle,
          productUrl,
        },
      };
    });
    const recipients = notificationData.map((n) => n.to).filter(Boolean);

    try {
      await notificationModuleService.createNotifications(notificationData);
      logger.info(
        `[send-restock-notification] emails queued=${notificationData.length} recipients=${recipients.join(",")}`,
      );
    } catch (err) {
      logger.error(
        `[send-restock-notification] failed to queue emails: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  },
);
