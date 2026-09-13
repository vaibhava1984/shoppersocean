/**
 * BookShelf Diagnostic Script
 * Run this in your Supabase SQL Editor to troubleshoot missing books
 */

-- 1. Check total books in database
SELECT COUNT(*) as total_books FROM books;

-- 2. Check books with correct status
SELECT 
  COUNT(*) as books_with_complete_status,
  SUM(CASE WHEN isCompletelyFilled = true THEN 1 ELSE 0 END) as completely_filled,
  SUM(CASE WHEN is_deleted = false THEN 1 ELSE 0 END) as not_deleted,
  SUM(CASE WHEN isCompletelyFilled = true AND is_deleted = false THEN 1 ELSE 0 END) as should_display
FROM books;

-- 3. Check language values (to see what's actually in DB)
SELECT DISTINCT language, COUNT(*) as count 
FROM books 
WHERE is_deleted = false AND isCompletelyFilled = true
GROUP BY language;

-- 4. Check author_id values (to see what's actually in DB)
SELECT DISTINCT author_id, author, COUNT(*) as count 
FROM books 
WHERE is_deleted = false AND isCompletelyFilled = true
GROUP BY author_id, author
ORDER BY count DESC;

-- 5. Check cover_images field (to see if images exist)
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN cover_images IS NOT NULL THEN 1 ELSE 0 END) as has_cover_images,
  SUM(CASE WHEN cover_images = '[]'::jsonb THEN 1 ELSE 0 END) as empty_array
FROM books
WHERE is_deleted = false AND isCompletelyFilled = true;

-- 6. Sample books that should be displayed
SELECT 
  id, 
  title, 
  language, 
  author_id, 
  author, 
  isCompletelyFilled, 
  is_deleted,
  cover_images,
  created_at
FROM books 
WHERE is_deleted = false AND isCompletelyFilled = true
LIMIT 10;

-- 7. Check if indexes were created
SELECT * FROM pg_indexes 
WHERE tablename IN ('books', 'authors')
ORDER BY tablename, indexname;

-- 8. Check authors table
SELECT * FROM authors 
WHERE is_deleted = false
ORDER BY name;

-- 9. Check for any NULL values that might cause issues
SELECT 
  COUNT(*) as total_books,
  SUM(CASE WHEN title IS NULL THEN 1 ELSE 0 END) as null_titles,
  SUM(CASE WHEN language IS NULL THEN 1 ELSE 0 END) as null_language,
  SUM(CASE WHEN author_id IS NULL THEN 1 ELSE 0 END) as null_author_id,
  SUM(CASE WHEN description IS NULL THEN 1 ELSE 0 END) as null_description,
  SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) as null_price,
  SUM(CASE WHEN cover_images IS NULL THEN 1 ELSE 0 END) as null_cover_images
FROM books
WHERE is_deleted = false AND isCompletelyFilled = true;
