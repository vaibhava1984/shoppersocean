-- Core Shoppers Ocean domain schema for the Oracle PostgreSQL migration.
-- This is additive and independent of Supabase auth/storage.

create table if not exists authors (
  author_id uuid primary key,
  user_id uuid references app_users(id) on delete set null,
  name text not null,
  bio text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists authors_user_idx on authors(user_id);
create index if not exists authors_deleted_name_idx on authors(is_deleted, name);

create table if not exists books (
  id uuid primary key,
  title text not null,
  description text,
  author_id uuid references authors(author_id) on delete set null,
  author_name text,
  language text,
  genre text,
  price numeric(12,2),
  cover_images jsonb,
  is_deleted boolean not null default false,
  isCompletelyFilled boolean not null default false,
  publisher_id uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_visibility_idx
  on books(is_deleted, isCompletelyFilled);
create index if not exists books_language_author_idx
  on books(language, author_id, is_deleted);
create index if not exists books_genre_idx on books(genre);

create table if not exists private_book_files (
  id uuid primary key,
  book_id uuid not null references books(id) on delete cascade,
  file_path text not null,
  file_name text,
  file_type text,
  created_at timestamptz not null default now()
);
create index if not exists private_book_files_book_idx on private_book_files(book_id);

create table if not exists orders (
  id uuid primary key,
  user_id uuid references app_users(id) on delete set null,
  product_id uuid references books(id) on delete set null,
  razorpay_order_id text unique,
  order_date timestamptz not null default now(),
  status text,
  amount numeric(12,2),
  currency text,
  created_at timestamptz not null default now()
);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_product_idx on orders(product_id);

create table if not exists payments (
  id uuid primary key,
  order_id uuid references orders(id) on delete cascade,
  razorpay_payment_id text,
  razorpay_order_id text,
  status text,
  amount numeric(12,2),
  currency text,
  created_at timestamptz not null default now()
);
create index if not exists payments_order_idx on payments(order_id);

create table if not exists testimonials (
  id uuid primary key,
  users text,
  description text,
  rating integer,
  book_id uuid references books(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists testimonials_book_idx on testimonials(book_id);

create table if not exists authors_interest_submission (
  id uuid primary key,
  user_id uuid references app_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text,
  data jsonb
);
create index if not exists author_submissions_user_idx on authors_interest_submission(user_id);

create table if not exists layout_settings (
  id bigserial primary key,
  page_section text not null,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  id uuid primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index if not exists password_reset_user_idx on password_reset_tokens(user_id);
