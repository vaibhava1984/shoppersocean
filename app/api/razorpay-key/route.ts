import { NextResponse } from 'next/server';

export async function GET() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

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
