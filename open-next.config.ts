import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  incrementalCache: {
    type: "kv",
    options: {
      namespace: "NEXT_INC_CACHE",
    },
  },
});
