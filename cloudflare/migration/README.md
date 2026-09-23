# Shoppers Ocean data migration

This directory defines the safe, non-destructive migration contract from the current Supabase backend to Cloudflare D1/R2 and Clerk.

## Source snapshot verified

The currently healthy Supabase backend contains:
- profiles: 46
- authors: 3
- books: 8
- private_book_files: 8
- orders: 13
- payments: 13
- testimonials: 1
- authors_interest_submission: 0
- layout_settings: 7

These counts were verified directly before preparing the migration layer.

The older Supabase project `pqtilyzqyssrujbsmtxn` is inactive and could not be queried because its database connection timed out. It must therefore remain untouched until its data/storage can be recovered safely.

## Mapping rules

- Preserve every existing UUID as the D1 primary key.
- `profiles.id` becomes `users.id`.
- Clerk's `externalId` should carry the original user UUID where supported.
- `authors.author_id`, `books.id`, `orders.id`, `payments.id`, and review IDs remain unchanged.
- PostgreSQL booleans become D1 integers (0/1).
- JSONB values become JSON text.
- `private_book_files.file_path` remains the source locator and receives an `r2_key` after the corresponding object is copied to R2.
- No book object is made public during migration.
- Existing bcrypt password digests must be imported into Clerk; plaintext passwords must never be generated or stored for migration.

## Validation gates

Before cutover, the migration must verify:
1. Row counts match.
2. Every foreign-key relationship resolves.
3. Every book has its expected private file/object.
4. Every completed purchase still authorizes the same book.
5. Existing user authentication/passwords work through Clerk.
6. Admin/publisher roles are preserved.
7. Reviews, authors and homepage layout selections are preserved.
8. Account deletion, password reset/change and profile editing work.
9. Book reading works through the protected R2 path.
10. Only after all gates pass may production authentication/data endpoints be switched.

## Important

This migration directory is preparation only. It does not delete, modify, pause, or replace the Supabase source of truth.
