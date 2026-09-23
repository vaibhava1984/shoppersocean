import type { CloudflareEnv } from "../auth/types";
export const SECTION_TYPES=["HOMEPAGE_TRENDING","HOMEPAGE_COLLECTION","HS"] as const;
export async function getLayout(env:CloudflareEnv){return env.DB.prepare("SELECT id,page_section,value FROM layout_settings ORDER BY id").all<{id:string;page_section:string;value:string}>();}
export async function addLayout(env:CloudflareEnv,section:string,bookId:string){
  const max=section==="HOMEPAGE_TRENDING"?3:section==="HOMEPAGE_COLLECTION"?4:null;
  const exists=await env.DB.prepare("SELECT id FROM layout_settings WHERE page_section=?1 AND value=?2 LIMIT 1").bind(section,bookId).first();
  if(exists) throw new Error("Book is already in this section");
  if(max!==null){const row=await env.DB.prepare("SELECT COUNT(*) AS count FROM layout_settings WHERE page_section=?1").bind(section).first<{count:number}>();if((row?.count??0)>=max) throw new Error(`This section is full. Maximum ${max} books allowed.`);}
  const id=crypto.randomUUID(); await env.DB.prepare("INSERT INTO layout_settings(id,created_at,page_section,value) VALUES(?1,datetime('now'),?2,?3)").bind(id,section,bookId).run(); return id;
}
export async function removeLayout(env:CloudflareEnv,id:string){await env.DB.prepare("DELETE FROM layout_settings WHERE id=?1").bind(id).run();}
