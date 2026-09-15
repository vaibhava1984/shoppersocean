import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Admin review editing is disabled. Reviews are written by logged-in users from individual book details.' },
    { status: 403 }
  )
}
