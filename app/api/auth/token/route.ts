import { getCurrentUser } from "@/utils/auth/session";
export async function GET(){const user=await getCurrentUser();return Response.json({token:user?.id??null},{headers:{"Cache-Control":"no-store, max-age=0"}})}
