import { createClient as createDbClient, getUser as getDbUser } from "@/utils/db/server";

export function createClient() {
  return createDbClient();
}

export const getUser = getDbUser;
