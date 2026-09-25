import { NextResponse } from "next/server";
import { uploadBookFile } from "@/utils/storage";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const key = String(form.get("key") || "");

  if (!(file instanceof File) || !key) {
    return NextResponse.json({ error: "File and key are required." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  await uploadBookFile(key, bytes, file.type || "application/pdf");
  return NextResponse.json({ key });
}
