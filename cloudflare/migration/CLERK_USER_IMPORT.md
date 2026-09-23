# Clerk user migration

The importer in `import-clerk-users.mjs` is intentionally separate from the application build.

It accepts an export containing the existing Supabase user UUID, email, profile fields, role, and the existing bcrypt password digest. **Plaintext passwords are never accepted or generated.**

The importer:
- creates the corresponding Clerk user;
- preserves the original Supabase UUID in Clerk `external_id`;
- stores the application role in Clerk public metadata;
- stores mobile/address and the original UUID in private metadata;
- never deletes or changes Supabase users.

Clerk's current Backend API supports `password_digest` with `password_hasher: "bcrypt"`, and Clerk documents basic export/import as a supported migration strategy. citeturn0search3turn0search6

## Not yet executed

The importer must **not** be executed until:
1. the production Clerk instance exists;
2. its secret key is available securely as an environment secret;
3. the verified Supabase user export has been produced;
4. the export has been checked for duplicate emails and missing password digests.

After import, user counts and authentication must be verified before any production authentication switch.

Never commit the export JSON or a Clerk secret to GitHub.
