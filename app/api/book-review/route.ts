import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server_admin'

export async function POST(request: Request) {
  try {
    const authClient = createClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to write a review.' }, { status: 401 })
    }

    const { bookId, description, rating } = await request.json()
    const cleanDescription = String(description ?? '').trim()
    const numericRating = Number(rating)

    if (!bookId || !cleanDescription || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Please provide a review and a rating from 1 to 5.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: 'Book not found.' }, { status: 404 })
    }

    const { error: reviewError } = await supabase
      .from('testimonials')
      .insert({
        description: cleanDescription,
        rating: numericRating,
        users: user.user_metadata?.full_name || user.email || 'Reader',
        user_id: user.id,
        book_id: String(book.id),
      })

    if (reviewError) {
      if (reviewError.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this book.' }, { status: 409 })
      }
      console.error('Error inserting book review:', reviewError)
      return NextResponse.json({ error: 'Failed to submit your review.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Review submitted successfully.' }, { status: 201 })
  } catch (error) {
    console.error('Unexpected book review error:', error)
    return NextResponse.json({ error: 'Unable to submit your review.' }, { status: 500 })
  }
}
