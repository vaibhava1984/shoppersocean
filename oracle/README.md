# Shoppers Ocean — Oracle migration

This directory is the permanent backend foundation for the Oracle OCI deployment.

## Target architecture
- Oracle Cloud Infrastructure (OCI) VM: application host
- PostgreSQL: primary application database
- Oracle Object Storage: book and flipbook asset storage
- Next.js/Node.js: web application and server APIs
- Razorpay: payments
- Transactional email: account and payment notifications

Supabase, Vercel, Cloudflare, and Clerk are not runtime dependencies of the final architecture.

## Migration order
1. Provision Oracle infrastructure and PostgreSQL.
2. Import and verify existing data.
3. Configure private database/storage credentials.
4. Implement application authentication and sessions.
5. Replace data/auth/storage integrations route by route.
6. Verify purchases and protected flipbook access.
7. Verify admin operations and account management.
8. Run functional checks before DNS cutover.
9. Cut over shoppersocean.com only after the new stack is ready.
10. Remove legacy service dependencies.

The existing UI and flipbook behaviour are preserved; this migration changes infrastructure and data access rather than redesigning the product.
