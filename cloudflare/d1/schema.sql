PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  country TEXT,
  mobile TEXT,
  address TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  published_by TEXT,
  author_id TEXT,
  title TEXT,
  author_name TEXT,
  description TEXT,
  isbn TEXT,
  price REAL,
  language TEXT,
  genre TEXT,
  pages INTEGER,
  binding TEXT,
  publisher TEXT,
  published_date TEXT,
  ratings REAL,
  cover_images TEXT,
  available_formats TEXT,
  is_deleted INTEGER DEFAULT 0,
  isCompletelyFilled INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(author_id) REFERENCES authors(author_id),
  FOREIGN KEY(published_by) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS authors (
  author_id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  bio TEXT,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(user_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS authors_interest_submission (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER,
  total_amount REAL,
  currency TEXT,
  status TEXT,
  contact_number TEXT,
  email TEXT,
  razorpay_order_id TEXT UNIQUE,
  order_date TEXT,
  created_at TEXT,
  updated_at TEXT,
  shipping_address TEXT,
  display_amount REAL,
  display_currency TEXT,
  FOREIGN KEY(user_id) REFERENCES profiles(id),
  FOREIGN KEY(product_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  payment_id TEXT UNIQUE,
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
  updated_at TEXT,
  FOREIGN KEY(order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  book_id TEXT,
  user_id TEXT,
  description TEXT,
  rating REAL,
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES profiles(id),
  FOREIGN KEY(book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS private_book_files (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_type TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY(book_id) REFERENCES books(id)
);

CREATE TABLE IF NOT EXISTS layout_settings (
  id INTEGER PRIMARY KEY,
  page_section TEXT,
  value TEXT,
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user_product ON orders(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON orders(user_id, order_date);
CREATE INDEX IF NOT EXISTS idx_private_book_files_book ON private_book_files(book_id);
CREATE INDEX IF NOT EXISTS idx_authors_user ON authors(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_book ON testimonials(user_id, book_id);
