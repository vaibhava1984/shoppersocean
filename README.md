# Shoppers Ocean

Shoppers Ocean is a Next.js application deployed as a single Cloudflare Worker using OpenNext and Cloudflare D1. Private book files are stored in Backblaze B2 and payments use Razorpay.

## Production
- Worker: shoppersocean
- Domain: https://www.shoppersocean.com
- Source branch: main
- Database: Cloudflare D1
- Authentication: application-managed D1 + JWT/session cookies
