import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pages: Record<string, { title: string; subtitle: string; accent: string }> = {
  home: { title: "Shoppers Ocean", subtitle: "Digital Flipbooks · Games · Quizzes · Learning", accent: "#0756b8" },
  about: { title: "About Shoppers Ocean", subtitle: "A world of reading, learning, gaming and entertainment", accent: "#0756b8" },
  books: { title: "Explore Digital Books", subtitle: "Discover multilingual books and interactive flipbooks", accent: "#087e8b" },
  children: { title: "Books for Children", subtitle: "Stories and reading adventures for young readers", accent: "#e17b24" },
  entertainment: { title: "Entertainment", subtitle: "Online games, quizzes, riddles and brain challenges", accent: "#6d36b5" },
  games: { title: "Classic Games", subtitle: "Play engaging games on Shoppers Ocean", accent: "#087e8b" },
  learning: { title: "Learning Academy", subtitle: "Build knowledge and strengthen your English skills", accent: "#16734a" },
  quizzes: { title: "Quiz World", subtitle: "General knowledge, riddles and mystery quizzes", accent: "#a33a72" },
  services: { title: "Our Services", subtitle: "Flipbooks, author publishing, games and learning", accent: "#0756b8" },
  contact: { title: "Contact Shoppers Ocean", subtitle: "We would love to hear from you", accent: "#087e8b" },
  authors: { title: "Publish Your Flipbook", subtitle: "Share your writing with readers around the world", accent: "#9a5a16" },
  policies: { title: "Author Policies", subtitle: "Guidelines and information for Shoppers Ocean authors", accent: "#596579" },
  privacy: { title: "Privacy Policy", subtitle: "How Shoppers Ocean handles information and privacy", accent: "#596579" },
  terms: { title: "Terms and Conditions", subtitle: "Terms governing the use of Shoppers Ocean", accent: "#596579" },
};

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const item = pages[slug] ?? {
    title: slug.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    subtitle: "Explore more on Shoppers Ocean",
    accent: "#0756b8",
  };
  const title = escapeXml(item.title);
  const subtitle = escapeXml(item.subtitle);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${item.accent}"/><stop offset="1" stop-color="#071b3b"/></linearGradient><radialGradient id="glow"><stop stop-color="#ffffff" stop-opacity=".22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1020" cy="90" r="360" fill="url(#glow)"/><circle cx="120" cy="620" r="300" fill="url(#glow)"/><rect x="70" y="70" width="1060" height="490" rx="34" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".28"/><text x="120" y="180" fill="#ffffff" font-family="Arial,sans-serif" font-size="28" font-weight="700" letter-spacing="5">SHOPPERS OCEAN</text><path d="M120 220h130" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".8"/><text x="120" y="340" fill="#ffffff" font-family="Arial,sans-serif" font-size="64" font-weight="700">${title}</text><text x="120" y="410" fill="#e7f3ff" font-family="Arial,sans-serif" font-size="30">${subtitle}</text><text x="120" y="505" fill="#ffffff" fill-opacity=".8" font-family="Arial,sans-serif" font-size="22">Read · Play · Learn · Explore</text></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=86400, s-maxage=86400" } });
}
