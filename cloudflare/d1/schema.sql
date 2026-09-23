-- Shoppers Ocean Cloudflare D1 target schema.
-- Target only: this file does not modify the current Supabase database.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, clerk_user_id TEXT UNIQUE, email TEXT UNIQUE NOT NULL,
 full_name TEXT NOT NULL DEFAULT '', country TEXT NOT NULL DEFAULT '',
 mobile TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '',
 role TEXT NOT NULL DEFAULT 'user', created_at TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS authors (
 author_id TEXT PRIMARY KEY, user_id TEXT, name TEXT NOT NULL, bio TEXT,
 is_deleted INTEGER NOT NULL DEFAULT 0, created_at TEXT, updated_at TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS books (
 id TEXT PRIMARY KEY, published_date TEXT, is_completely_filled INTEGER NOT NULL DEFAULT 0,
 binding TEXT, language TEXT, publisher TEXT, pages INTEGER, is_deleted INTEGER NOT NULL DEFAULT 0,
 genre TEXT, ratings INTEGER, published_by TEXT, description TEXT, isbn TEXT, price REAL,
 title TEXT NOT NULL, cover_images TEXT, author_id TEXT, created_at TEXT, updated_at TEXT,
 available_formats TEXT, author_name TEXT NOT NULL DEFAULT '',
 FOREIGN KEY(author_id) REFERENCES authors(author_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS private_book_files (
 id TEXT PRIMARY KEY, book_id TEXT NOT NULL, file_path TEXT NOT NULL, file_name TEXT NOT NULL,
 file_type TEXT, r2_key TEXT, created_at TEXT, updated_at TEXT,
 FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, user_id TEXT, product_id TEXT, quantity INTEGER NOT NULL DEFAULT 1,
 total_amount REAL, currency TEXT, status TEXT, contact_number TEXT, email TEXT,
 razorpay_order_id TEXT UNIQUE, order_date TEXT, created_at TEXT, updated_at TEXT,
 shipping_address TEXT, display_amount REAL, display_currency TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES books(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS payments (
 id TEXT PRIMARY KEY, order_id TEXT UNIQUE, razorpay_order_id TEXT, payment_id TEXT UNIQUE,
 signature TEXT, status TEXT, original_currency TEXT, original_amount REAL, amount_in_inr REAL,
 payment_method TEXT, bank TEXT, card_network TEXT, card_last4 TEXT, error_code TEXT,
 error_description TEXT, created_at TEXT, updated_at TEXT,
 FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS testimonials (
 id TEXT PRIMARY KEY, book_id TEXT, user_id TEXT, description TEXT, rating INTEGER, users TEXT UNIQUE,
 created_at TEXT, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS authors_interest_submission (
 id INTEGER PRIMARY KEY, created_at TEXT, user_id TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS layout_settings (
 id INTEGER PRIMARY KEY, created_at TEXT, page_section TEXT, value TEXT
);

CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_product ON orders(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_files_book ON private_book_files(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book ON testimonials(book_id);
CREATE INDEX IF NOT EXISTS idx_layout_section ON layout_settings(page_section);
CREATE INDEX IF NOT EXISTS idx_authors_user ON authors(user_id);