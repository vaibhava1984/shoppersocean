-- Shoppers Ocean Cloudflare D1 target schema.
-- This is a migration target only. It does not modify the current Supabase database.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  mobile TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  is_author INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS authors (
  author_id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  bio TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  cover_images TEXT NOT NULL DEFAULT '[]',
  author_name TEXT,
  author_id TEXT,
  language TEXT,
  genre TEXT,
  pages INTEGER,
  published_date TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (author_id) REFERENCES authors(author_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS private_book_files (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  r2_key TEXT,
  created_at TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  shipping_address TEXT,
  contact_number TEXT,
  email TEXT,
  status TEXT,
  order_date TEXT,
  total_amount REAL,
  display_amount REAL,
  currency TEXT,
  display_currency TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES books(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  signature TEXT,
  status TEXT,
  original_currency TEXT,
  original_amount REAL,
  amount_in_inr REAL,
  payment_method TEXT,
  bank TEXT,
  card_network TEXT,
  card_last4 TEXT,
  error_code TEXT,
  error_description TEXT,
  created_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  rating INTEGER,
  users TEXT,
  user_id TEXT,
  book_id TEXT,
  created_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS authors_interest_submission (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  message TEXT,
  status TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS layout_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_section TEXT NOT NULL,
  value TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_product ON orders(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_files_book ON private_book_files(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book ON testimonials(book_id);
CREATE INDEX IF NOT EXISTS idx_layout_section ON layout_settings(page_section);
CREATE INDEX IF NOT EXISTS idx_authors_user ON authors(user_id);
