-- Database migration: Add indexes for bookShelf performance
-- These indexes speed up the queries in the bookShelf page

-- ✅ Index on books table for filtering and common queries
CREATE INDEX IF NOT EXISTS idx_books_language_deleted 
ON books(language, is_deleted) 
WHERE isCompletelyFilled = true;

-- ✅ Index on books table for author filtering
CREATE INDEX IF NOT EXISTS idx_books_author_deleted 
ON books(author_id, is_deleted) 
WHERE isCompletelyFilled = true;

-- ✅ Index on books table for combined language + author filtering
CREATE INDEX IF NOT EXISTS idx_books_language_author 
ON books(language, author_id, is_deleted) 
WHERE isCompletelyFilled = true;

-- ✅ Index on authors table for menu queries
CREATE INDEX IF NOT EXISTS idx_authors_deleted 
ON authors(is_deleted) 
ORDER BY name ASC;

-- ✅ Index on books title for ordering
CREATE INDEX IF NOT EXISTS idx_books_title 
ON books(title) 
WHERE is_deleted = false;
