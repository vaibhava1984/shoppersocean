# Clerk authentication boundary

This directory is the migration boundary for authentication.

## Supported application flows

- sign in
- sign up
- sign out
- password reset
- password change
- authenticated session → D1 user mapping
- account deletion

The production browser implementation will use Clerk's supported frontend
authentication components/SDK. The Worker never receives or stores a user's
password.

## Migration safety

Supabase remains the source of truth until Clerk users and D1 records have
been verified. Existing password hashes are not stored in this repository.

The Clerk backend import must be performed with secure Clerk credentials and
the existing compatible password digests; that operation is intentionally
outside source control.
