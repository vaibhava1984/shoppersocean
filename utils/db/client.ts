import { createAuthClient } from "@/utils/auth/client";

type Filter = { kind: "eq" | "neq" | "in"; column: string; value: unknown };

class QueryBuilder {
  private table: string;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private columns = "*";
  private filters: Filter[] = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitValue?: number;
  private payload: unknown;

  constructor(table: string) { this.table = table; }
  select(columns = "*") { this.operation = "select"; this.columns = columns; return this; }
  insert(values: unknown) { this.operation = "insert"; this.payload = values; return this; }
  update(values: unknown) { this.operation = "update"; this.payload = values; return this; }
  delete() { this.operation = "delete"; return this; }
  eq(column: string, value: unknown) { this.filters.push({ kind: "eq", column, value }); return this; }
  neq(column: string, value: unknown) { this.filters.push({ kind: "neq", column, value }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ kind: "in", column, value }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderBy = { column, ascending: options?.ascending !== false }; return this; }
  limit(value: number) { this.limitValue = value; return this; }

  private async execute() {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: this.table, operation: this.operation, columns: this.columns,
        filters: this.filters, orderBy: this.orderBy, limit: this.limitValue, payload: this.payload
      })
    });
    return response.json();
  }

  then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.execute().then(onfulfilled, onrejected);
  }
  async single() { const result = await this.execute(); return { data: result.data?.[0] ?? null, error: result.error ?? null }; }
  async maybeSingle() { return this.single(); }
}

export function createClient() {
  return { from(table: string) { return new QueryBuilder(table); }, auth: createAuthClient() };
}
