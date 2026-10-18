"use client"

import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Star, MessageCircle, Trash2 } from "lucide-react"

type Comment = {
  id: string
  description: string
  rating: number | null
  users: string
  user_id?: string
  book_id?: string
  parent_id?: string | null
  created_at?: string
  is_admin?: number
}

export default function BookReviewSection({ bookId, userId, isAdmin = false }: { bookId: string; userId?: string; isAdmin?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState(0)
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/book-review?bookId=${encodeURIComponent(bookId)}&t=${Date.now()}`, { cache: "no-store" })
      const result = await response.json()
      if (response.ok) setComments(result.reviews || [])
      else setMessage(result.error || "Unable to load comments.")
    } catch { setMessage("Unable to load comments.") }
    finally {
      setLoading(false)
      if (typeof window !== "undefined" && window.location.hash.startsWith("#comment-")) {
        window.setTimeout(() => document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ behavior: "smooth", block: "center" }), 250)
      }
    }
  }, [bookId])

  useEffect(() => { void loadComments() }, [loadComments])

  const submitComment = async (parent?: Comment) => {
    const text = (parent ? replyText : description).trim()
    if (!userId || !text) {
      setMessage("Please write a comment before submitting.")
      return
    }
    setSubmitting(true)
    setMessage("")
    try {
      const response = await fetch("/api/book-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ bookId, description: text, rating: parent ? 0 : rating, parentId: parent?.id }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) { setMessage(result.error || "Unable to submit comment."); return }
      if (parent) { setReplyText(""); setReplyTo(null) } else { setDescription(""); setRating(0) }
      await loadComments()
      setMessage(parent ? "Reply posted." : "Comment posted successfully.")
    } catch { setMessage("Unable to submit comment. Please try again.") }
    finally { setSubmitting(false) }
  }

  const deleteComment = async (comment: Comment) => {
    if (!window.confirm("Delete this comment?")) return
    try {
      const response = await fetch("/api/book-review", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ id: comment.id }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) { setMessage(result.error || "Unable to delete comment."); return }
      setComments(current => current.filter(item => item.id !== comment.id && item.parent_id !== comment.id))
      setMessage("Comment deleted.")
    } catch { setMessage("Unable to delete comment. Please try again.") }
  }

  const renderComment = (comment: Comment, isReply = false): ReactNode => (
    <article id={`comment-${comment.id}`} key={comment.id} className={`rounded-lg border border-blue-100 bg-white p-3 sm:p-4 ${isReply ? "ml-5 sm:ml-10 mt-2 border-slate-200 bg-slate-50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-800">{comment.is_admin || comment.users?.toLowerCase() === "admin" ? "admin" : comment.users || "Reader"}</span>
        {Number(comment.rating) > 0 && <span className="inline-flex items-center gap-0.5" aria-label={`${comment.rating} out of 5 stars`}>
          {Array.from({ length: Math.min(5, Number(comment.rating)) }, (_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-500" />)}
        </span>}
        {comment.created_at && <time className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</time>}
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{comment.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold">
        {userId && (isAdmin || comment.user_id !== userId) && <button type="button" onClick={() => { setReplyTo(comment); setReplyText(""); setMessage(""); }} className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900"><MessageCircle size={14}/> Reply</button>}
        {userId && (isAdmin || comment.user_id === userId) && <button type="button" onClick={() => void deleteComment(comment)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"><Trash2 size={14}/> Delete</button>}
      </div>
      {replyTo?.id === comment.id && <div className="mt-3 space-y-2">
        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} maxLength={2000} placeholder={`Reply to ${comment.is_admin || comment.users?.toLowerCase() === "admin" ? "admin" : comment.users}...`} className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 outline-none focus:border-blue-500"/>
        <div className="flex gap-2"><button type="button" disabled={submitting} onClick={() => void submitComment(comment)} className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? "Posting..." : "Post reply"}</button><button type="button" onClick={() => setReplyTo(null)} className="rounded-md border px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button></div>
      </div>}
      {comments.filter(reply => reply.parent_id === comment.id).map(reply => renderComment(reply, true))}
    </article>
  )

  const topLevel = comments.filter(comment => !comment.parent_id)
  return <section id="book-comments" className="mt-12 scroll-mt-24">
    <div className="mb-5"><h2 className="text-2xl font-bold text-slate-800">Comments</h2></div>
    {loading ? <p className="py-4 text-sm text-slate-500">Loading comments...</p> : topLevel.length > 0 ? <div className="mb-8 space-y-3">
      {topLevel.map(comment => renderComment(comment))}
    </div> : <p className="mb-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No comments yet. Be the first to comment.</p>}
    {userId ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
      <h3 className="mb-3 text-lg font-bold text-slate-800">Write a comment</h3>
      <div className="mb-3 flex items-center gap-2"><span className="text-xs text-slate-500">Optional rating</span>{[1,2,3,4,5].map(value => <button key={value} type="button" aria-label={`${value} star rating`} onClick={() => setRating(rating === value ? 0 : value)} className="rounded p-0.5"><Star className={`h-4 w-4 ${value <= rating ? "fill-yellow-400 text-yellow-500" : "text-slate-300"}`}/></button>)}{rating > 0 && <button type="button" onClick={() => setRating(0)} className="text-xs text-slate-500 underline">Clear</button>}</div>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write your comment about this book..." rows={4} maxLength={2000} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
      <button type="button" onClick={() => void submitComment()} disabled={submitting} className="mt-3 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? "Posting..." : "Post comment"}</button>
      {message && <p role="status" className="mt-3 text-sm text-slate-600">{message}</p>}
    </div> : <p className="rounded-lg bg-slate-50 p-4 text-slate-600">Please sign in to write a comment.</p>}
  </section>
}
