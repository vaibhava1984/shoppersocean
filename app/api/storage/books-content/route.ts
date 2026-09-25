import { NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/session";
import { uploadBookPdf, deleteBookAsset } from "@/lib/cloudinary";

async function authorize() {
  const user: any = await getFirebaseUser();
  const role = user?.userrole || user?.role;
  return user && role === "ADMIN";
}

export async function POST(request: Request) {
  if (!(await authorize())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  try {
    const form = await request.formData();
    const path = String(form.get("path") || "");
    const file = form.get("file");
    if (!path || !(file instanceof File)) return NextResponse.json({ error: "File and path are required" }, { status: 400 });
    if (!String(file.type || "").toLowerCase().includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF book files are supported" }, { status: 400 });
    }
    const publicId = path.replace(/^protected-books\//, "").replace(/\.pdf$/i, "");
    const uploaded = await uploadBookPdf(file, `protected-books/${publicId}`);
    return NextResponse.json({ success: true, path: uploaded.public_id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await authorize())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  try {
    const { paths } = await request.json();
    const list = Array.isArray(paths) ? paths : [paths];
    await Promise.all(list.filter(Boolean).map((path: string) => deleteBookAsset(path)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
  }
}
