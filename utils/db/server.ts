import { env } from "cloudflare:workers";

type Row = Record<string, unknown>;

type Filter = { kind: "eq" | "neq" | "in"; column: string; value: unknown };

function parseColumns(columns: string) {
  if (columns.trim() === "*") return "*";
  return columns
    .split(",")
    .map((v) => v.trim())
    .filter((v) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(v))
    .join(", ");
}

class QueryBuilder {
  private table: string;
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private columns = "*";
  private filters: Filter[] = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitValue?: number;
  private payload: Row | Row[] | null = null;

  constructor(table: string) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(table)) throw new Error("Invalid table name");
    this.table = table;
  }

  select(columns = "*") { this.operation = "select"; this.columns = parseColumns(columns); return this; }
  insert(values: Row | Row[]) { this.operation = "insert"; this.payload = values; return this; }
  update(values: Row) { this.operation = "update"; this.payload = values; return this; }
  delete() { this.operation = "delete"; return this; }
  eq(column: string, value: unknown) { this.filters.push({ kind: "eq", column, value }); return this; }
  neq(column: string, value: unknown) { this.filters.push({ kind: "neq", column, value }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ kind: "in", column, value }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderBy = { column, ascending: options?.ascending !== false }; return this; }
  limit(value: number) { this.limitValue = value; return this; }

  async single() { const result = await this.execute(); return { data: result.data?.[0] ?? null, error: result.error }; }
  async maybeSingle() { const result = await this.execute(); return { data: result.data?.[0] ?? null, error: result.error }; }

  async execute() {
    try {
      const where: string[] = [];
      const bindings: unknown[] = [];
      for (const filter of this.filters) {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(filter.column)) throw new Error("Invalid column name");
        if (filter.kind === "eq") { where.push(`${filter.column} = ?`); bindings.push(filter.value); }
        if (filter.kind === "neq") { where.push(`${filter.column} != ?`); bindings.push(filter.value); }
        if (filter.kind === "in") {
          const values = Array.isArray(filter.value) ? filter.value : [];
          if (!values.length) { where.push("1 = 0"); }
          else { where.push(`${filter.column} IN (${values.map(() => "?").join(",")})`); bindings.push(...values); }
        }
      }

      const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      const orderSql = this.orderBy ? ` ORDER BY ${this.orderBy.column} ${this.orderBy.ascending ? "ASC" : "DESC"}` : "";
      const limitSql = this.limitValue != null ? ` LIMIT ${Math.max(0, Math.floor(this.limitValue))}` : "";

      if (this.operation === "select") {
        const result = await env.DB.prepare(`SELECT ${this.columns} FROM ${this.table}${whereSql}${orderSql}${limitSql}`).bind(...bindings).all();
        return { data: result.results as Row[], error: null };
      }

      if (this.operation === "delete") {
        const result = await env.DB.prepare(`DELETE FROM ${this.table}${whereSql}`).bind(...bindings).run();
        return { data: null, error: null, count: result.meta.changes };
      }

      const rows = Array.isArray(this.payload) ? this.payload : this.payload ? [this.payload] : [];
      if (!rows.length) return { data: null, error: new Error("No data supplied") };

      if (this.operation === "insert") {
        const keys = Object.keys(rows[0]);
        const placeholders = keys.map(() => "?").join(", ");
        for (const row of rows) {
          await env.DB.prepare(`INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${placeholders})`)
            .bind(...keys.map((key) => row[key]))
            .run();
        }
        return { data: rows, error: null };
      }

      if (this.operation === "update") {
        const row = rows[0];
        const keys = Object.keys(row);
        const setSql = keys.map((key) => `${key} = ?`).join(", ");
        await env.DB.prepare(`UPDATE ${this.table} SET ${setSql}${whereSql}`)
          .bind(...keys.map((key) => row[key]), ...bindings)
          .run();
        return { data: null, error: null };
      }

      return { data: null, error: new Error("Unsupported database operation") };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  then<TResult1 = Awaited<ReturnType<QueryBuilder["execute"]>>, TResult2 = never>(
    onfulfilled?: ((value: Awaited<ReturnType<QueryBuilder["execute"]>>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createClient() {
  return {
    from(table: string) { return new QueryBuilder(table); },
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      }
    }
  };
}

export function createAdminClient() {
  return createClient();
}

export const getUser = async () => null;
