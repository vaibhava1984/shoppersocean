import { writeFileSync } from "node:fs";

const config = {
  name: "shoppersocean",
  main: ".open-next/worker.js",
  compatibility_date: "2026-10-25",
  compatibility_flags: ["nodejs_compat"],
  vars: {
    B2_BUCKET: "Shoppers-ocean-books",
    B2_ENDPOINT: "s3.us-west-004.backblazeb2.com",
    B2_REGION: "us-west-004"
  },
  assets: {
    directory: ".open-next/assets",
    binding: "ASSETS"
  },
  d1_databases: [
    {
      binding: "DB",
      database_name: "shoppers-ocean-db",
      database_id: "735056e1-63e7-410b-94bb-853221ab50fc"
    }
  ]
};

writeFileSync(".open-next/wrangler.json", JSON.stringify(config, null, 2));
console.log("Created Worker deployment configuration for shoppersocean.");
