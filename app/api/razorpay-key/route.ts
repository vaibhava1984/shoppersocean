import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function GET() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const keyId = env.RAZORPAY_KEY_ID;
    if (!keyId) return NextResponse.json({ error: 'Razorpay public key is not configured' }, { status: 500 });
    return NextResponse.json({ keyId }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error reading Razorpay key:', error);
    return NextResponse.json({ error: 'Razorpay public key is not configured' }, { status: 500 });
  }
}