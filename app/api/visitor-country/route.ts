import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  // Cloudflare supplies this header from the visitor's IP address.
  // Never cache this response: the country is visitor-specific.
  const rawCountry = (
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country-code') ||
    ''
  ).trim().toUpperCase();

  const country = /^[A-Z]{2}$/.test(rawCountry) && rawCountry !== 'XX' && rawCountry !== 'T1'
    ? rawCountry
    : null;

  return NextResponse.json(
    { country },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
  );
}
