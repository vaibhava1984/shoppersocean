import type { CloudflareEnv } from "../auth/types";
export type AuthorRow={author_id:string;user_id:string|null;name:string;bio:string|null;is_deleted:number|null;created_at:string;updated_at:string};
export async function listAuthors(env:CloudflareEnv){return env.DB.prepare("SELECT * FROM authors WHERE COALESCE(is_deleted,0)=0 ORDER BY name").all<AuthorRow>();}
export async function getAuthor(env:CloudflareEnv,id:string){return env.DB.prepare("SELECT * FROM authors WHERE author_id=?1 LIMIT 1").bind(id).first<AuthorRow>();}
export async function getAuthorByUserId(env:CloudflareEnv,userId:string){return env.DB.prepare("SELECT * FROM authors WHERE user_id=?1 AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(userId).first<AuthorRow>();}
