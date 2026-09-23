/**
 * Minimal Clerk Backend API boundary.
 *
 * No Clerk secret is stored in source. The Worker will inject the real
 * implementation when the Clerk instance is provisioned.
 */
export type ClerkAdminClient = {
  deleteUser(clerkUserId: string): Promise<void>;
  updateUser?(clerkUserId: string, input: {
    firstName?: string;
    lastName?: string;
    externalId?: string;
  }): Promise<void>;
};
