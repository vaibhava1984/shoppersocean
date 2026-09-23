import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { getToken } = await auth();
  const token = await getToken();

  return Response.json(
    { token: token ?? null },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
