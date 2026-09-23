import type { CloudflareEnv } from "../auth/types";
import { servePurchasedBook } from "../reader/purchased-book";

/**
 * Worker-facing route for the existing flipbook reader.
 * The flipbook UI can continue requesting /api/get-book-reader?bookId=...
 * after the final vinext/Workers cutover.
 *
 * verifyToken is injected because Clerk verification requires the deployed
 * Clerk verifier/secret and is intentionally not hard-coded here.
 */
export async function handlePurchasedBookRoute(
  request: Request,
  env: CloudflareEnv,
  verifyToken: Parameters<typeof servePurchasedBook>[2],
): Promise<Response> {
  const result = await servePurchasedBook(request, env, verifyToken);
  return result.response;
}
