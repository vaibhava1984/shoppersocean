# Shoppers Ocean Cloudflare data layer

This schema mirrors the application data model while preserving the existing UUID/string identifiers. Existing profile IDs remain the stable application identity so historical orders, payments, authors, testimonials, books and private-file records are not orphaned when Clerk user IDs are introduced.

Migration order:
1. Export verified Supabase rows.
2. Import parent records into D1.
3. Import dependent records.
4. Populate profiles.clerk_user_id by verified email/identity mapping.
5. Verify row counts and foreign-key relationships.
6. Copy private book files to R2 and verify checksums/file sizes.
7. Switch application reads/writes to D1/R2.
8. Only after production verification, remove Supabase dependencies.

Do not delete the Supabase project, storage objects, or old rows during preparation.
