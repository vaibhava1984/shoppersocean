import { redirect } from "next/navigation";

// Keep the legacy Read E-books URL useful for shared and bookmarked links.
// The public catalogue is the canonical destination for browsing books.
export default function ReadEbooksRedirect() {
  redirect("/books");
}
