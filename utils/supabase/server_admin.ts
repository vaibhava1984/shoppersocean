import { createAdminClient } from "@/utils/db/server";

export function createAdminClientCompat() {
  return createAdminClient();
}

export { createAdminClient };
