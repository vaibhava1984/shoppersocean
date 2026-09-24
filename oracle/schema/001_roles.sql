-- Oracle PostgreSQL application roles.
-- Authentication is application-owned; there is deliberately no dependency
-- on Supabase auth.users or Supabase JWT hooks.

create table if not exists app_users (
  id uuid primary key,
  name text not null,
  country text not null,
  email text not null unique,
  password_hash text not null,
  mobile text,
  mobile_verified boolean not null default false,
  complete_address text,
  role text not null default 'user'
    check (role in ('admin','publisher','user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_users_role_idx on app_users(role);
create index if not exists app_users_email_idx on app_users(lower(email));

create table if not exists app_sessions (
  id uuid primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists app_sessions_user_idx on app_sessions(user_id);
create index if not exists app_sessions_expiry_idx on app_sessions(expires_at);
