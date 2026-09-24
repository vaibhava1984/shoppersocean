export type HomepageBook={id:string;title:string;description:string;coverImage?:string;images?:string[];author?:string;price:number};
export type HomepageBookPlacement=HomepageBook&{pageSection:string};
let homepageBooksPromise:Promise<HomepageBookPlacement[]>|null=null;
export function getHomepageBooks():Promise<HomepageBookPlacement[]>{
 if(homepageBooksPromise)return homepageBooksPromise;
 homepageBooksPromise=fetch('/api/homepage_sections?section=homepage',{cache:'no-store'}).then(async r=>{
  const data=await r.json(); if(!r.ok)throw new Error(data.error||'Failed to load homepage books');
  return (Array.isArray(data)?data:(data?.books??[])) as HomepageBookPlacement[];
 }).catch(error=>{homepageBooksPromise=null;throw error});
 return homepageBooksPromise;
}
