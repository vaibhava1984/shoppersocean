import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams.get("q")?.trim() ?? ""

    if (search.length < 2) {
      return NextResponse.json({ books: [] })
    }

    const escapedSearch = search.replace(/[%,]/g, (character) => `\\${character}`)
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("books")
      .select("id, title, author_name")
      .or(`title.ilike.%${escapedSearch}%,author_name.ilike.%${escapedSearch}%`)
      .eq("is_deleted", false)
      .order("title", { ascending: true })
      .limit(12)

    if (error) {
      console.error("Book search error:", error)
      return NextResponse.json({ error: "Unable to search books" }, { status: 500 })
    }

    return NextResponse.json({
      books: (data ?? []).map((book) => ({
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
