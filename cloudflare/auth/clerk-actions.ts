/**
 * Application-level Clerk authentication contract.
 *
 * The UI can use this contract without knowing whether authentication is
 * backed by Clerk's browser SDK or a future custom flow. No secrets belong
 * in this module.
 */
export type ClerkAuthClient = {
  signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; code: string; message: string }>;
  signUp(input: {
    email: string;
    password: string;
    fullName: string;
    country: string;
    mobile?: string;
    address?: string;
  }): Promise<{ ok: true; needsEmailVerification?: boolean } | { ok: false; code: string; message: string }>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; code: string; message: string }>;
  changePassword(currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; code: string; message: string }>;
};
