import {
  addDoc, collection, deleteDoc, getDocs, limit as fsLimit, orderBy, query, updateDoc, where
} from "firebase/firestore"
import {
  createUserWithEmailAndPassword, getIdToken, sendEmailVerification,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updatePassword,
  updateProfile, onAuthStateChanged
} from "firebase/auth"
import { firebaseAuth, firebaseDb, firebaseStorage } from "./client"
import { ref as storageRef, uploadBytes, deleteObject } from "firebase/storage"

type Row = Record<string, any>

function project(rows: Row[], fields?: string) {
  if (!fields || fields.trim() === "*" || fields.includes("(")) return rows
  const names = fields.split(",").map(s => s.trim()).filter(Boolean)
  return rows.map(row => Object.fromEntries(names.map(k => [k, row[k]])))
}

class QueryBuilder {
  private sort?: { field: string; direction: "asc" | "desc" }
  private take?: number
  private offset = 0
  private fields?: string
  private filters: Array<[string, string, any]> = []
  constructor(private table: string) {}
  select(fields = "*", _options?: any) { this.fields = fields; return this }
  eq(field: string, value: any) { this.filters.push([field, "==", value]); return this }
  neq(field: string, value: any) { this.filters.push([field, "!=", value]); return this }
  in(field: string, values: any[]) { this.filters.push([field, "in", values]); return this }
  gte(field: string, value: any) { this.filters.push([field, ">=", value]); return this }
  gt(field: string, value: any) { this.filters.push([field, ">", value]); return this }
  lte(field: string, value: any) { this.filters.push([field, "<=", value]); return this }
  lt(field: string, value: any) { this.filters.push([field, "<", value]); return this }
  not(field: string, op: string, value: any) {
    if (op === "is" && value === null) this.filters.push([field, "!=", null])
    return this
  }
  is(field: string, op: string, value: any) {
    if (op === "null") this.filters.push([field, "==", null])
    else if (op === "not_null") this.filters.push([field, "!=", null])
    return this
  }
  match(values: Row) { Object.entries(values).forEach(([k, v]) => this.eq(k, v)); return this }
  or(_expression: string) { return this }
  order(field: string, options?: { ascending?: boolean }) {
    this.sort = { field, direction: options?.ascending === false ? "desc" : "asc" }; return this
  }
  limit(value: number) { this.take = value; return this }
  range(from: number, to: number) { this.offset = from; this.take = Math.max(0, to - from + 1); return this }
  async single() {
    const r = await this.execute()
    return { data: r.data?.[0] ?? null, error: r.data?.length === 1 ? null : new Error("Expected exactly one row") }
  }
  async maybeSingle() { const r = await this.execute(); return { data: r.data?.[0] ?? null, error: null } }
  async execute() {
    try {
      const constraints: any[] = []
      for (const [field, op, value] of this.filters) constraints.push(where(field, op as any, value))
      if (this.sort) constraints.push(orderBy(this.sort.field, this.sort.direction))
      if (this.take !== undefined) constraints.push(fsLimit(this.offset + this.take))
      const snap = await getDocs(query(collection(firebaseDb, this.table), ...constraints))
      let rows = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Row[]
      if (this.offset) rows = rows.slice(this.offset)
      if (this.take !== undefined) rows = rows.slice(0, this.take)
      return { data: project(rows, this.fields), error: null, count: rows.length }
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Firestore query failed", code: error?.code }, count: 0 }
    }
  }
  then(resolve: any, reject?: any) { return this.execute().then(resolve, reject) }
}

class MutationQuery {
  private filters: Array<[string, string, any]> = []
  constructor(private table: string, private action: "update" | "delete", private payload: Row) {}
  eq(field: string, value: any) { this.filters.push([field, "==", value]); return this }
  in(field: string, values: any[]) { this.filters.push([field, "in", values]); return this }
  async execute() {
    try {
      const snap = await getDocs(query(collection(firebaseDb, this.table), ...this.filters.map(([f, o, v]) => where(f, o as any, v))))
      for (const d of snap.docs) {
        if (this.action === "delete") await deleteDoc(d.ref)
        else await updateDoc(d.ref, this.payload)
      }
      return { data: null, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Mutation failed" } }
    }
  }
  then(resolve: any, reject?: any) { return this.execute().then(resolve, reject) }
}

class MutationBuilder {
  constructor(private table: string) {}
  async insert(payload: Row | Row[]) {
    try {
      const rows = Array.isArray(payload) ? payload : [payload]
      const data: Row[] = []
      for (const row of rows) {
        const ref = await addDoc(collection(firebaseDb, this.table), row)
        data.push({ id: ref.id, ...row })
      }
      return { data, error: null }
    } catch (error: any) { return { data: null, error: { message: error?.message || "Insert failed" } } }
  }
  async upsert(payload: Row | Row[]) { return this.insert(payload) }
  update(payload: Row) { return new MutationQuery(this.table, "update", payload) }
  delete() { return new MutationQuery(this.table, "delete", {}) }
}

export function createClient() {
  return {
    from(table: string) {
      const q = new QueryBuilder(table)
      return {
        select: q.select.bind(q), eq: q.eq.bind(q), neq: q.neq.bind(q), in: q.in.bind(q),
        gte: q.gte.bind(q), gt: q.gt.bind(q), lte: q.lte.bind(q), lt: q.lt.bind(q),
        not: q.not.bind(q), is: q.is.bind(q), match: q.match.bind(q), or: q.or.bind(q),
        order: q.order.bind(q), limit: q.limit.bind(q), range: q.range.bind(q),
        single: q.single.bind(q), maybeSingle: q.maybeSingle.bind(q),
        insert: (p: any) => new MutationBuilder(table).insert(p),
        update: (p: any) => new MutationBuilder(table).update(p),
        delete: () => new MutationBuilder(table).delete(),
        upsert: (p: any) => new MutationBuilder(table).upsert(p),
      }
    },
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string, file: Blob, options?: { upsert?: boolean }) {
            try {
              const target = storageRef(firebaseStorage, bucket + "/" + path)
              await uploadBytes(target, file, { contentType: (file as any)?.type || undefined })
              return { data: { path }, error: null }
            } catch (error: any) {
              return { data: null, error: { message: error?.message || "Storage upload failed" } }
            }
          },
          async remove(paths: string[]) {
            try {
              await Promise.all(paths.map(path => deleteObject(storageRef(firebaseStorage, bucket + "/" + path))))
              return { data: null, error: null }
            } catch (error: any) {
              return { data: null, error: { message: error?.message || "Storage removal failed" } }
            }
          }
        }
      }
    },
    auth: {
      async signInWithPassword({ email, password }: any) {
        try {
          const cred = await signInWithEmailAndPassword(firebaseAuth, email, password)
          const access_token = await getIdToken(cred.user)
          await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: access_token }) })
          return { data: { user: cred.user, session: { access_token } }, error: null }
        } catch (error: any) {
          const code = error?.code?.includes("invalid-credential") ? "invalid_credentials" : error?.code
          return { data: { user: null, session: null }, error: { message: error?.message || "Sign in failed", code } }
        }
      },
      async signUp({ email, password, options }: any) {
        try {
          const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password)
          if (options?.data) await updateProfile(cred.user, { displayName: options.data.full_name || null })
          await sendEmailVerification(cred.user)
          return { data: { user: cred.user, session: { access_token: await getIdToken(cred.user) } }, error: null }
        } catch (error: any) {
          return { data: { user: null, session: null }, error: { message: error?.message || "Sign up failed", code: error?.code } }
        }
      },
      async getUser() {
        return new Promise<any>(resolve => {
          const unsub = onAuthStateChanged(firebaseAuth, user => { unsub(); resolve({ data: { user }, error: null }) })
        })
      },
      async getSession() {
        const user = firebaseAuth.currentUser
        return { data: { session: user ? { access_token: await getIdToken(user) } : null }, error: null }
      },
      async refreshSession() {
        const user = firebaseAuth.currentUser
        return { data: { session: user ? { access_token: await getIdToken(user, true) } : null }, error: null }
      },
      async signOut() { await signOut(firebaseAuth); await fetch("/api/auth/session", { method: "DELETE" }); return { error: null } },
      async updateUser({ password, data }: any) {
        const user = firebaseAuth.currentUser
        if (!user) return { data: { user: null }, error: { message: "Not authenticated" } }
        try {
          if (password) await updatePassword(user, password)
          if (data?.full_name) await updateProfile(user, { displayName: data.full_name })
          return { data: { user }, error: null }
        } catch (error: any) { return { data: { user }, error: { message: error?.message || "Update failed" } } }
      },
      async verifyOtp() { return { data: null, error: { message: "Mobile OTP will be migrated separately." } } },
      async resetPasswordForEmail(email: string) {
        try { await sendPasswordResetEmail(firebaseAuth, email); return { data: {}, error: null } }
        catch (error: any) { return { data: {}, error: { message: error?.message || "Reset failed" } } }
      },
    }
  }
}
