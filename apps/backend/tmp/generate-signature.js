const fs = require("fs");
const crypto = require("crypto");

const body = JSON.parse(
  fs.readFileSync("./tmp/pim-product-revision.json", "utf8")
);

const stable = (value) => {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stable).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
    .join(",")}}`;
};

const timestamp = process.env.TIMESTAMP;

const productHash = crypto
  .createHash("sha256")
  .update(stable(body.product))
  .digest("hex");

const signingPayload = [
  timestamp,
  body.event_id,
  body.source,
  body.occurred_at,
  body.product.external_id,
  body.product.revision,
  productHash,
].join(".");

const signature = crypto
  .createHmac("sha256", process.env.PIM_WEBHOOK_SECRET)
  .update(signingPayload)
  .digest("hex");

console.log(signature);
// console.log("Timestamp:", timestamp);
// console.log("Signing payload:", signingPayload);
// console.log("Product hash:", productHash);
// console.log("Secret:", process.env.PIM_WEBHOOK_SECRET);
// console.log("Signature:", signature);