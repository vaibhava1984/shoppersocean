import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Admin review creation is disabled. Reviews must be submitted by logged-in users from the individual book details page.' },
    { status: 403 }
  )
}
