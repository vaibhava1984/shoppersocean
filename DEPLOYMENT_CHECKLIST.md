# Shoppers Ocean — Netlify / Firebase / Backblaze Deployment Checklist

## Current architecture
- **Netlify:** Next.js website hosting and server/API execution.
- **Firebase:** Authentication and Firestore database.
- **Backblaze B2:** Private book PDF storage and protected reader delivery.
- **Razorpay:** Payments.
- **Resend:** Transactional email.

## Netlify configuration
- Build command: `npm run build`
- Node version: `22.x`
- `netlify.toml` is committed at the repository root.
- Do not connect or deploy through Vercel for this migration.

## Required Netlify environment variables
Set these in Netlify before the first production deployment. **Never commit their secret values to GitHub.**

### Firebase
- `NEXT_PUBLIC_FIREBASE_CONFIG` — Firebase web configuration JSON used by the browser.
- `FIREBASE_WEBAPP_CONFIG` — compatibility/config JSON if required by the client.
- `FIREBASE_SERVICE_ACCOUNT_JSON` — Firebase Admin service-account JSON for server-side authentication and Firestore.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — Firebase bucket name used by the Admin SDK configuration.

### Backblaze B2
- `B2_KEY_ID`
- `B2_APPLICATION_KEY`
- `B2_BUCKET_ID`
- `B2_BUCKET_NAME`
- `B2_ENDPOINT` (optional; defaults to `https://api.backblazeb2.com`)

### Payments
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Email
- `RESEND_API_KEY`

## First deployment checks
1. Confirm all required environment variables are present in Netlify.
2. Deploy the `firebase-final-migration` branch.
3. Confirm the build completes without the previous prerender/Invalid URL failure.
4. Verify:
   - Homepage loads.
   - Sign-up and sign-in work.
   - Settings/profile access works.
   - Admin authentication works.
   - Book browsing works.
   - Admin book upload reaches Backblaze.
   - A purchased book opens through the protected flipbook reader.
   - PDF download is not offered to users.
   - Razorpay payment verification writes the purchase.
   - Password-change and account-deletion emails send through Resend.
5. Only after these checks pass should the custom production domain be moved to Netlify.

## Migration policy
This is a fresh-start migration. Existing Supabase data/books are **not** being migrated. New books and users will use Firebase + Backblaze from the start.

## Important
- Do not put Firebase service-account JSON, Backblaze application keys, Razorpay secrets, or Resend API keys into source files.
- Avoid unnecessary deployments while configuration is being prepared.
