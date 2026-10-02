/**
 * Client-side auth helpers â replaces @/utils/supabase/client
 * Uses fetch calls to /api/auth/* endpoints instead of Supabase SDK.
 */

export interface ClientUser {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
}

let cachedUser: ClientUser | null | undefined;
let userPromise: Promise<ClientUser | null> | null = null;

export function createClient() {
  return {
    auth: {
      async getUser(): Promise<{ data: { user: ClientUser | null } }> {
        if (cachedUser !== undefined) return { data: { user: cachedUser } };
        if (!userPromise) {
          userPromise = fetch('/api/auth/me', { credentials: 'same-origin' })
            .then(r => (r.ok ? r.json() : null))
            .then(data => {
              cachedUser = data?.user || null;
              return cachedUser;
            })
            .catch(() => {
              cachedUser = null;
              return null;
            });
        }
        const user = await userPromise;
        return { data: { user } };
      },

      async getSession(): Promise<{ data: { session: { user: ClientUser | null; access_token: string | null } | null } }> {
        if (cachedUser === undefined) {
          await this.getUser();
        }
        if (cachedUser) {
          return { data: { session: { user: cachedUser, access_token: 'cookie-auth' } } };
        }
        return { data: { session: null } };
      },

      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        cachedUser = data.user;
        userPromise = null;
        return { data: { user: data.user } };
      },

      async signUp({ email, password, full_name, country }: { email: string; password: string; full_name?: string; country?: string }) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password, full_name, country }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        cachedUser = data.user;
        userPromise = null;
        return { data: { user: data.user } };
      },

      async signOut() {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        cachedUser = undefined;
        userPromise = null;
      },
    },
  };
}
