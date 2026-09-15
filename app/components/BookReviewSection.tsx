"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

type Review = {
  id: string
  description: string
  rating: number
  users: string
  user_id?: string
  book_id?: string
  created_at?: string
}

export default function BookReviewSection({ bookId, userId }: { bookId: string; userId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(`/api/book-review?bookId=${encodeURIComponent(bookId)}&t=${Date.now()}`, {
          cache: "no-store",
        })
        const result = await response.json()
        if (response.ok) {
          const loadedReviews = result.reviews || []
          setReviews(loadedReviews)
          const mine = loadedReviews.find((review: Review) => review.user_id === userId)
          if (mine) {
            setDescription(mine.description)
            setRating(mine.rating)
          }
        } else {
          setMessage(result.error || "Unable to load reviews.")
        }
      } catch {
        setMessage("Unable to load reviews.")
      } finally {
        setLoading(false)
      }
    }

    loadReviews()
  }, [bookId, userId])

  const submitReview = async () => {
    if (!userId) return
    if (!description.trim() || rating < 1) {
      setMessage("Please write your review and select a rating.")
      return
    }

    setSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/book-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ bookId, description, rating }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        setMessage(result.error || "Unable to submit your review.")
        return
      }

      if (result.review) {
        setReviews((current) => [result.review, ...current.filter((review) => review.id !== result.review.id)])
      }
      setMessage("Your review has been submitted successfully.")
    } catch {
      setMessage("Unable to submit your review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Reviews for this book</h2>
      </div>

      {!loading && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center mb-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star key={value} className={`h-5 w-5 ${value <= review.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" />
                ))}
              </div>
              <p className="text-slate-600 italic">"{review.description}"</p>
              <p className="mt-3 font-semibold text-slate-800">- {review.users}</p>
            </div>
          ))}
        </div>
      )}

      {userId ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Write your review</h3>
          <div className="flex items-center gap-1 mb-4" aria-label="Select rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value > 1 ? "s" : ""}`}
                onClick={() => setRating(value)}
                className="rounded-sm p-1 active:scale-95"
              >
                <Star className={`h-7 w-7 ${value <= rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" />
              </button>
            ))}
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write your review about this book..."
            rows={5}
            maxLength={2000}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="button"
            onClick={submitReview}
            disabled={submitting}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
          {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        </div>
      ) : (
        <p className="rounded-lg bg-slate-50 p-4 text-slate-600">Please sign in to write a review for this book.</p>
      )}
    </section>
  )
}
