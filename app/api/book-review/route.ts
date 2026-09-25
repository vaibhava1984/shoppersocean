import { NextResponse } from 'next/server'
import { getFirebaseUser } from '@/lib/firebase/session'
import { firestore } from '@/lib/firebase/admin'

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const bookId = params.get('bookId')
    const homepage = params.get('homepage') === 'true'
    if (!bookId && !homepage) return NextResponse.json({ error: 'Book ID is required.' }, { status: 400 })
    const snap = bookId
      ? await firestore.collection('testimonials').where('book_id', '==', bookId).get()
      : await firestore.collection('testimonials').get()
    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any,b:any) => String(b.created_at||'').localeCompare(String(a.created_at||'')))
    return NextResponse.json({ reviews }, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch (error) {
    console.error('Unexpected book review fetch error:', error)
    return NextResponse.json({ error: 'Unable to fetch reviews.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getFirebaseUser()
    if (!user) return NextResponse.json({ error: 'Please sign in to write a review.' }, { status: 401 })
    const { bookId, description, rating } = await request.json()
    const cleanDescription = String(description ?? '').trim()
    const numericRating = Number(rating)
    if (!bookId || !cleanDescription || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return NextResponse.json({ error: 'Please provide a review and a rating from 1 to 5.' }, { status: 400 })
    const book = await firestore.collection('books').doc(String(bookId)).get()
    if (!book.exists) return NextResponse.json({ error: 'Book not found.' }, { status: 404 })
    const existing = await firestore.collection('testimonials').where('book_id','==',String(bookId)).where('user_id','==',user.uid).limit(1).get()
    if (!existing.empty) return NextResponse.json({ error: 'You have already reviewed this book.' }, { status: 409 })
    const profile = await firestore.collection('profiles').doc(user.uid).get()
    const profileData:any = profile.exists ? profile.data() : null
    const ref = firestore.collection('testimonials').doc()
    const review = { id: ref.id, description: cleanDescription, rating: numericRating, users: profileData?.full_name || user.name || user.email || 'Reader', user_id: user.uid, book_id: String(bookId), created_at: new Date().toISOString() }
    await ref.set(review)
    return NextResponse.json({ message: 'Review submitted successfully.', review }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Unexpected book review error:', error)
    return NextResponse.json({ error: 'Unable to submit your review.' }, { status: 500 })
  }
}
