import { getCloudflareContext } from "@opennextjs/cloudflare";

type Row = Record<string, unknown>;

type Filter = { kind: "eq" | "neq" | "in"; column: string; value: unknown };

function parseColumns(columns: string) {
  if (columns.trim() === "*") return "*";
  return columns.split(",").map((v) => v.trim()).filter((v) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(v)).join(", ");
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
  eq(column: string, value: unknown) { this.filters.push({kind:"eq",column,value}); return this; }
  neq(column: string, value: unknown) { this.filters.push({kind:"neq",column,value}); return this; }
  in(column: string, value: unknown[]) { this.filters.push({kind:"in",column,value}); return this; }
  not(column: string, _operator: string, value: unknown) { this.filters.push({kind:"neq",column,value}); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderBy = {column, ascending: options?.ascending !== false}; return this; }
  limit(value: number) { this.limitValue = value; return this; }

  async single() { const result = await this.execute(); return {data: result.data?.[0] ?? null, error: result.error}; }
  async maybeSingle() { const result = await this.execute(); return {data: result.data?.[0] ?? null, error: result.error}; }

  async execute() {
    try {
      const env = getCloudflareContext().env as { DB: D1Database };
      const where: string[] = [];
      const bindings: unknown[] = [];
      for (const f of this.filters) {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(f.column)) throw new Error("Invalid column name");
        if (f.kind === "eq") { where.push(`${f.column} = ?`); bindings.push(f.value); }
        if (f.kind === "neq") { where.push(`${f.column} != ?`); bindings.push(f.value); }
        if (f.kind === "in") {
          const values = Array.isArray(f.value) ? f.value : [];
          if (!values.length) { where.push("1 = 0"); }
          else { where.push(`${f.column} IN (${values.map(() => "?").join(",")})`); bindings.push(...values); }
        }
      }
      const whereSql = where.length ? ` WHERE ${where.join(" AND ")}` : "";
      const orderSql = this.orderBy && /^[A-Za-z_][A-Za-z0-9_]*$/.test(this.orderBy.column)
        ? ` ORDER BY ${this.orderBy.column} ${this.orderBy.ascending ? "ASC" : "DESC"}` : "";
      const limitSql = this.limitValue != null ? ` LIMIT ${Math.max(0, Math.floor(this.limitValue))}` : "";

      if (this.operation === "select") {
        const result = await env.DB.prepare(`SELECT ${this.columns} FROM ${this.table}${whereSql}${orderSql}${limitSql}`).bind(...bindings).all();
        return {data: result.results as Row[], error: null};
      }

      if (this.operation === "delete") {
        const result = await env.DB.prepare(`DELETE FROM ${this.table}${whereSql}`).bind(...bindings).run();
        return {data: null, error: null, count: result.meta.changes};
      }

      const rows = Array.isArray(this.payload) ? this.payload : this.payload ? [this.payload] : [];
      if (!rows.length) return {data: null, error: new Error("No data supplied")};

      if (this.operation === "insert") {
        const keys = Object.keys(rows[0]);
        if (!keys.length) return {data:null,error:new Error("No data supplied")};
        for (const row of rows) {
          await env.DB.prepare(`INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`).bind(...keys.map(k => row[k])).run();
        }
        return {data: rows, error: null};
      }

      const row = rows[0];
      const keys = Object.keys(row);
      const setSql = keys.map(k => `${k} = ?`).join(", ");
      await env.DB.prepare(`UPDATE ${this.table} SET ${setSql}${whereSql}`).bind(...keys.map(k => row[k]), ...bindings).run();
      return {data: null, error: null};
    } catch (error) {
      return {data: null, error: error instanceof Error ? error : new Error(String(error))};
    }
  }

  then<TResult1 = Awaited<ReturnType<QueryBuilder["execute"]>>, TResult2 = never>(
    onfulfilled?: ((value: Awaited<ReturnType<QueryBuilder["execute"]>>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

function authApi() {
  return {
    getUser: async () => ({ data: { user: await (await import("@/utils/auth/server")).getSessionUser() }, error: null }),
    signInWithPassword: async (input: {email:string;password:string}) => (await import("@/utils/auth/server")).signInUser(input.email, input.password),
    signUp: async (input: any) => (await import("@/utils/auth/server")).signUpUser({ email: input.email, password: input.password, fullName: input.options?.data?.full_name || "", country: input.options?.data?.country || "", address: input.options?.data?.address || "" }),
    updateUser: async (input: any) => (await import("@/utils/auth/server")).updateCurrentUser({ password: input.password, phone: input.phone, email: input.email }),
    signOut: async () => { await (await import("@/utils/auth/server")).clearSession(); return { error: null }; },
    verifyOtp: async () => ({ error: new Error("Phone OTP is not used on Shoppers Ocean.") }),
  };
}

export function createClient() {
  return { from: (table: string) => new QueryBuilder(table), auth: authApi() };
}

export function createAdminClient() { return createClient(); }
export const getUser = async () => (await import("@/utils/auth/server")).getSessionUser();
