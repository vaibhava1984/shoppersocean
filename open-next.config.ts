import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare migration target only.
 *
 * The live application remains on the existing runtime until the
 * authentication, D1, R2, purchase authorization, and flipbook
 * validation gates are complete.
 */
export default defineCloudflareConfig({});
