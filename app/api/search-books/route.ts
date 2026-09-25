import { firestore } from "@/lib/firebase/admin"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? ""
    if (search.length < 2) return NextResponse.json({ books: [] })

    const snapshot = await firestore.collection("books").where("is_deleted", "==", false).get()
    const books = snapshot.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
      .filter((book: any) =>
        String(book.title ?? "").toLowerCase().includes(search) ||
        String(book.author_name ?? "").toLowerCase().includes(search)
      )
      .sort((a: any, b: any) => String(a.title ?? "").localeCompare(String(b.title ?? "")))
      .slice(0, 12)

    return NextResponse.json({
      books: books.map((book: any) => ({
        id: book.id,
        title: book.title,
        author: book.author_name,
      })),
    })
  } catch (error) {
    console.error("Unexpected book search error:", error)
    return NextResponse.json({ error: "Unable to search books" }, { status: 500 })
  }
}
