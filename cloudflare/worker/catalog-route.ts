import type { CloudflareEnv } from "../auth/types";
import { getBook, listBooks, searchBooks } from "../db/books";
import { listAuthors } from "../db/authors";
import { getLayout } from "../db/layout";

export async function handleCatalog(request:Request,env:CloudflareEnv):Promise<Response>{
 const url=new URL(request.url); const p=url.pathname;
 if(p==="/api/search-books"){const q=url.searchParams.get("q")?.trim()||""; if(q.length<2)return Response.json({books:[]}); const r=await searchBooks(env,q); return Response.json({books:r.results.map(x=>({id:x.id,title:x.title,author:x.author_name}))},{headers:{"Cache-Control":"public, max-age=30"}});}
 if(p==="/api/books"){const r=await listBooks(env);return Response.json({books:r.results},{headers:{"Cache-Control":"public, max-age=60"}});}
 if(p==="/api/authors"){const r=await listAuthors(env);return Response.json({authors:r.results},{headers:{"Cache-Control":"public, max-age=60"}});}
 if(p==="/api/homepage-layout"){const layout=await getLayout(env);const ids=layout.results.map(x=>x.value);const books=ids.length?await (await import("../db/books")).getBooksByIds(env,ids):[];const map=new Map(books.map(b=>[b.id,b]));return Response.json({sections:layout.results.map(x=>({entryId:x.id,pageSection:x.page_section,id:x.value,title:map.get(x.value)?.title??null,author:map.get(x.value)?.author_name??null,missing:!map.has(x.value)||Boolean(map.get(x.value)?.is_deleted)}))});}
 const id=p.match(/^\/api\/books\/([^/]+)$/)?.[1]; if(id){const book=await getBook(env,id);return book?Response.json({book}):new Response("Book not found",{status:404});}
 return new Response("Not found",{status:404});
}
