export type ShoppersOceanUser = {
  id: string; clerkUserId: string; email: string; fullName: string; country: string; mobile: string; address: string;
  role: "admin" | "publisher" | "user";
};
export type CloudflareEnv = {
  DB: D1Database; BOOKS_BUCKET: R2Bucket; CLERK_SECRET_KEY?: string; RAZORPAY_KEY_SECRET?: string; RESEND_API_KEY?: string;
};
