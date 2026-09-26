# Shoppers Ocean — Cloudflare Migration Lock

Status: LOCKED

## Target architecture

- Cloudflare Workers: application/backend runtime.
- Cloudflare D1: fresh relational database for users, books metadata, authors, orders, payments, reviews/testimonials, roles and settings.
- Cloudflare R2: NOT activated and NOT required for the initial rebuild because billing is not being enabled.
- Supabase: completely removed from the target architecture.
- Existing Supabase books, users, orders and other data: NOT migrated. The rebuild starts with fresh data.

## Book files

D1 will store book metadata and references, not the actual large PDF binaries. Cloudflare documents R2 as its object/blob storage product for large files. Because R2 requires an R2 subscription/checkout, it remains disabled under the current no-billing constraint.

Until a no-billing file-storage path is selected, the fresh application must not pretend that PDF upload/storage is available. The application can be rebuilt and tested with an empty catalogue while the file-storage layer remains isolated.

## Non-negotiable constraints

- Do not reintroduce Supabase.
- Do not activate R2 or request billing details unless the user explicitly changes this decision.
- Do not use the paused Vercel project.
- Do not deploy blindly; validate the rebuilt application before production deployment.
- Preserve the existing Shoppers Ocean UI and requested functionality as closely as the new architecture permits.
