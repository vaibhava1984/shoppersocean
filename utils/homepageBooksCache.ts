export type HomepageBook = { id:string; title:string; description:string; coverImage?:string; images?:string[]; author?:string; price:number }
export type HomepageBookPlacement = HomepageBook & { pageSection:string }
let homepageBooksPromise:Promise<HomepageBookPlacement[]>|null=null
export function getHomepageBooks():Promise<HomepageBookPlacement[]> {
 if(homepageBooksPromise)return homepageBooksPromise
 homepageBooksPromise=fetch('/api/homepage-books').then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Unable to load homepage books');return d.books||[]}).catch(e=>{homepageBooksPromise=null;throw e})
 return homepageBooksPromise
}