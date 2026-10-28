import { readFileSync, writeFileSync } from "node:fs";

const customWorker = readFileSync("custom-worker.ts", "utf8")
  .replace('from "./.open-next/worker.js"', 'from "./worker.js"')
  .replace('from "./utils/subscriptions/reminders"', 'from "../utils/subscriptions/reminders"')
  .replace('from "./utils/subscriptions/reconcile"', 'from "../utils/subscriptions/reconcile"');

writeFileSync(".open-next/custom-worker.ts", customWorker);

const config = {
  name: "shoppersocean",
  main: "custom-worker.ts",
  compatibility_date: "2026-10-25",
  compatibility_flags: ["nodejs_compat"],
  vars: {
    B2_BUCKET: "Shoppers-ocean-books",
    B2_ENDPOINT: "s3.us-west-004.backblazeb2.com",
    B2_REGION: "us-west-004"
  },
  assets: {
    directory: "assets",
    binding: "ASSETS"
  },
  d1_databases: [
    {
      binding: "DB",
      database_name: "shoppers-ocean-db",
      database_id: "735056e1-63e7-410b-94bb-853221ab50fc"
    }
  ],
  triggers: {
    crons: ["0 * * * *"]
  }
};

writeFileSync(".open-next/wrangler.json", JSON.stringify(config, null, 2));
console.log("Created Shoppers Ocean Worker configuration with subscription reminder and reconciliation cron handlers.");
