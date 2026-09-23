# Cloudflare migration scaffold

This directory contains the non-production target configuration for moving Shoppers Ocean away from Supabase.

## Components

- D1: relational application data
- R2: private book/flipbook objects
- Workers: authenticated server-side APIs
- Clerk: authentication/session provider
- vinext: Next.js runtime on Workers

The live application is intentionally not switched to these files yet.

## Security

- Never expose D1 credentials, Clerk secret keys, Razorpay secrets, Resend API keys, or R2 credentials to the browser.
- Book objects remain private in R2.
- Purchase checks happen in Worker/server code.
- Existing Supabase data remains the source of truth until migration verification is complete.
