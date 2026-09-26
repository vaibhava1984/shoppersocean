import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/db/server";

export async function POST(request: Request) {
  const body = await request.json();
  const allowed = ["select", "insert", "update", "delete"];
  if (!allowed.includes(body.operation)) {
    return NextResponse.json({ data: null, error: "Unsupported operation" }, { status: 400 });
  }
  const db = createAdminClient();
  let query = db.from(body.table);
  if (body.operation === "select") query = query.select(body.columns || "*");
  if (body.operation === "insert") query = query.insert(body.payload);
  if (body.operation === "update") query = query.update(body.payload);
  if (body.operation === "delete") query = query.delete();
  for (const filter of body.filters || []) {
    if (filter.kind === "eq") query = query.eq(filter.column, filter.value);
    if (filter.kind === "neq") query = query.neq(filter.column, filter.value);
    if (filter.kind === "in") query = query.in(filter.column, filter.value);
  }
  if (body.orderBy) query = query.order(body.orderBy.column, { ascending: body.orderBy.ascending });
  if (body.limit != null) query = query.limit(body.limit);
  return NextResponse.json(await query);
}
