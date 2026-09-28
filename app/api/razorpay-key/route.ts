import { NextResponse } from 'next/server';

export async function GET() {
  // RAZORPAY_KEY_ID is the server-side name used by the payment routes.
  // Keep NEXT_PUBLIC_RAZORPAY_KEY_ID as a compatibility fallback.
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId) {
    return NextResponse.json(
      { error: 'Razorpay public key is not configured.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { keyId },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
