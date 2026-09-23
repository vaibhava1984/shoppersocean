# Shoppers Ocean — Cloudflare Migration Inventory

This branch prepares the application for migration from Supabase to a Cloudflare-native backend without changing the live site.

## Target architecture

- Authentication: Clerk
- Relational data: Cloudflare D1
- Private book/flipbook files: Cloudflare R2
- Server APIs and purchase authorization: Cloudflare Workers
- Next.js runtime: Cloudflare Workers using vinext
- Payments: Razorpay (existing integration retained)
- Email: Resend (existing integration retained)

## Current Supabase responsibilities discovered in the repository

| Current resource | Main responsibility | Target |
| --- | --- | --- |
| auth.users / Supabase Auth | sign-in, sign-up, sessions, password changes | Clerk |
| profiles | user profile fields | D1 |
| books | book catalogue and metadata | D1 |
| authors | author records | D1 |
| authors_interest_submission | author applications | D1 |
| orders | purchases / purchase authorization | D1 |
| payments | payment records | D1 |
| private_book_files | protected book-file metadata | D1 + R2 object |
| testimonials | reviews/testimonials | D1 |
| layout_settings | homepage book placement/settings | D1 |
| user_roles / JWT role claims | admin/role authorization | D1 + Clerk metadata |
| Supabase RPCs | transactional/order/admin operations | Worker service functions / D1 transactions |

## RPCs that must be replaced

- create_order_and_payment
- get_order_stats
- set_claim
- delete_claim

These must not be replaced with client-side logic. They belong behind authenticated Worker endpoints.

## Authentication migration requirements

The repository currently depends on Supabase Auth in server actions, middleware, client login, account deletion, password change, profile updates, purchase checks, and admin authorization.

Existing users must be migrated without forcing unnecessary password resets where technically possible. The existing system uses bcrypt password hashes; Clerk supports importing existing password digests, so this will be evaluated as the migration path.

## Book/flipbook requirements

- Keep existing flipbook UI/interaction behavior.
- Keep existing book metadata.
- Move protected book objects to R2.
- Keep purchase authorization server-side.
- No PDF-download button in the final user-facing book flow.
- Existing and future books use “Read as flipbook”.
- Do not make protected R2 objects publicly accessible.

## Safety rules for this migration

1. Do not delete the existing Supabase data until the replacement is verified.
2. Do not change the production domain during preparation.
3. Do not introduce unrelated UI changes.
4. Do not perform repeated production deployments while the backend migration is incomplete.
5. Migrate data before changing live authentication or purchase authorization.
6. Verify login, signup, logout, password reset/change, account deletion, purchases, payment verification, admin access, book reading, and reviews before cutover.

## Current status

Repository audit: started and mapped.
Migration branch: created.
Production site: unchanged by this preparation work.
Cloudflare/Clerk resource provisioning: not performed by this branch; it requires access to those services.
