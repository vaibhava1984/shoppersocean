# Shoppers Ocean — External File Storage Lock

Status: LOCKED

## Storage architecture

- Cloudflare Workers: application/backend/runtime.
- Cloudflare D1: relational application data.
- External object storage: book PDFs and other uploaded files.
- Cloudflare R2: NOT used.
- Supabase Storage: NOT used.
- D1 must not store large PDF binaries.

## Candidate provider

Backblaze B2 is the initial storage candidate because its current official signup states that no credit card is required, it provides free storage, and it exposes an S3-compatible API suitable for Worker integration.

The provider remains replaceable: the application must isolate file-storage operations behind a storage adapter so another provider can be substituted later without changing book/catalogue logic.

## Non-negotiable

No storage provider may be activated if it requires a billing method/card for the free setup. The application must never expose storage credentials to browsers.

Book metadata and the storage object key/reference belong in D1; the PDF binary belongs in the external storage provider.
