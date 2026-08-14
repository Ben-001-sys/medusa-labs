import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Heading,
  Text,
  Button,
  Tailwind,
} from "@react-email/components";

type VariantRestockEmailProps = {
  productTitle?: string;
  variantTitle?: string;
  productImage?: string;
  formattedPrice?: string;
  currencyCode?: string;
  productHandle?: string;
  productUrl?: string;
  variant?: any;
};

function formatPrice(amount?: number | string, currency?: string) {
  try {
    if (amount == null) return "";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      currencyDisplay: "narrowSymbol",
    }).format(num);
  } catch (e) {
    return String(amount);
  }
}

function VariantRestockEmailComponent({
  productTitle: directProductTitle,
  variantTitle: directVariantTitle,
  productImage: directProductImage,
  formattedPrice: directFormattedPrice,
  currencyCode: directCurrencyCode,
  productHandle: directProductHandle,
  productUrl,
  variant,
}: VariantRestockEmailProps) {
  const image =
    directProductImage ||
    variant?.productImage ||
    variant?.product_image ||
    variant?.thumbnail ||
    (variant?.images && variant.images[0] && variant.images[0].url) ||
    "";
  const productTitle =
    directProductTitle ||
    variant?.productTitle ||
    variant?.product_title ||
    variant?.product?.title ||
    "";
  const variantTitle =
    directVariantTitle ||
    variant?.variantTitle ||
    variant?.variant_title ||
    variant?.title ||
    "";
  const price =
    variant?.priceAmount ||
    (variant?.prices &&
      variant.prices[0] &&
      (variant.prices[0].amount ?? variant.prices[0].value)) ||
    variant?.unit_price ||
    variant?.calculated_price ||
    "";
  const currency =
    directCurrencyCode ||
    variant?.currencyCode ||
    (variant?.prices && variant.prices[0] && variant.prices[0].currency_code) ||
    variant?.currency_code ||
    "USD";
  const handle =
    directProductHandle ||
    variant?.productHandle ||
    variant?.product_handle ||
    variant?.product?.handle ||
    "";

  const storefrontBase = (process.env.STOREFRONT_URL || "").replace(/\/+$/, "");
  const url =
    productUrl ||
    variant?.productUrl ||
    variant?.product_url ||
    (handle ? `${storefrontBase}/products/${handle}` : "#");

  const formattedPrice = directFormattedPrice || formatPrice(price, currency);

  return (
    <Html>
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .email-body { background: #111827 !important; color: #e5e7eb !important; }
            .card { background: #0b1220 !important; }
            .muted { color: #9ca3af !important; }
            .button { background: #f3f4f6 !important; color: #0b1220 !important; }
          }
          @media (max-width:600px) {
            .stack { display: block !important; }
            .stack img { width: 100% !important; height: auto !important; }
          }
        `}</style>
      </Head>
      <Preview>{`Back in stock: ${productTitle} ${variantTitle}`}</Preview>
      <Tailwind>
        <Body
          className="email-body"
          style={{
            background: "#f3f4f6",
            fontFamily: "Arial, Helvetica, sans-serif",
            padding: "24px",
          }}
        >
          <Container style={{ maxWidth: "700px", margin: "0 auto" }}>
            {/* Logo */}
            <Section style={{ textAlign: "center", padding: "24px 0" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "140px",
                  height: "40px",
                  borderRadius: "6px",
                  background: "#111827",
                  color: "#fff",
                  lineHeight: "40px",
                  fontWeight: 700,
                }}
              >
                Medusa Labs Store
              </div>
            </Section>

            {/* Card */}
            <Section
              className="card"
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Greeting */}
              <div
                style={{ padding: "24px", borderBottom: "1px solid #eef2f7" }}
              >
                <Heading
                  style={{ margin: 0, fontSize: "20px", color: "#111827" }}
                >
                  Good news — it’s back in stock!
                </Heading>
                <Text
                  className="muted"
                  style={{ marginTop: "8px", color: "#6b7280" }}
                >
                  You asked to be notified when this item became available.
                </Text>
              </div>

              {/* Product area */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "0 0 200px", maxWidth: "200px" }}>
                  {image ? (
                    <Img
                      src={image}
                      alt={productTitle}
                      width="200"
                      height="200"
                      style={{
                        display: "block",
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "200px",
                        height: "200px",
                        background: "#f3f4f6",
                        borderRadius: "6px",
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: "1 1 300px", minWidth: "200px" }}>
                  <Text
                    style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}
                  >
                    {productTitle}
                  </Text>
                  <Heading
                    style={{
                      margin: "8px 0",
                      fontSize: "18px",
                      color: "#111827",
                    }}
                  >
                    {variantTitle}
                  </Heading>
                  <Text
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      color: "#111827",
                      fontWeight: 700,
                    }}
                  >
                    {formattedPrice}
                  </Text>
                  <Text
                    style={{
                      margin: "0 0 16px 0",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    In stock — available to order now
                  </Text>

                  <div>
                    <Button
                      href={url}
                      className="button"
                      style={{
                        background: "#111827",
                        color: "#ffffff",
                        padding: "12px 20px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer note inside card */}
              <div
                style={{ padding: "16px 24px", borderTop: "1px solid #eef2f7" }}
              >
                <Text
                  className="muted"
                  style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}
                >
                  If you don’t want these notifications, you can ignore this
                  email.
                </Text>
              </div>
            </Section>

            {/* Footer */}
            <Section style={{ textAlign: "center", paddingTop: "18px" }}>
              <Text
                className="muted"
                style={{ margin: 0, color: "#6b7280", fontSize: "12px" }}
              >
                Need help? Reply to this email or contact our support.
              </Text>
              <Text
                className="muted"
                style={{ marginTop: "8px", color: "#9ca3af", fontSize: "11px" }}
              >
                © {new Date().getFullYear()} Medusa Labs. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export const variantRestockEmail = (props: VariantRestockEmailProps) => (
  <VariantRestockEmailComponent {...props} />
);

// Mock preview data (for development)
const mock = {
  variant: {
    productTitle: "Premium Leather Jacket",
    variantTitle: "Medium / Black",
    productImage:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/jacket.png",
    priceAmount: 249.99,
    currencyCode: "USD",
    productHandle: "premium-leather-jacket",
  },
  productUrl: "https://store.example.com/products/premium-leather-jacket",
};

export default () => <VariantRestockEmailComponent {...mock} />;
