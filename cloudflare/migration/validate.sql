-- Run after D1 import.
PRAGMA foreign_keys = ON;

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'authors', COUNT(*) FROM authors
UNION ALL SELECT 'books', COUNT(*) FROM books
UNION ALL SELECT 'private_book_files', COUNT(*) FROM private_book_files
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL SELECT 'authors_interest_submission', COUNT(*) FROM authors_interest_submission
UNION ALL SELECT 'layout_settings', COUNT(*) FROM layout_settings;

SELECT COUNT(*) AS orphan_authors
FROM authors a LEFT JOIN users u ON u.id = a.user_id
WHERE a.user_id IS NOT NULL AND u.id IS NULL;

SELECT COUNT(*) AS orphan_books
FROM books b LEFT JOIN authors a ON a.author_id = b.author_id
WHERE b.author_id IS NOT NULL AND a.author_id IS NULL;

SELECT COUNT(*) AS orphan_files
FROM private_book_files f LEFT JOIN books b ON b.id = f.book_id
WHERE b.id IS NULL;

SELECT COUNT(*) AS orphan_orders
FROM orders o LEFT JOIN users u ON u.id = o.user_id
WHERE o.user_id IS NOT NULL AND u.id IS NULL;

SELECT COUNT(*) AS orphan_payments
FROM payments p LEFT JOIN orders o ON o.id = p.order_id
WHERE o.id IS NULL;

SELECT COUNT(*) AS completed_purchase_links
FROM orders o
JOIN books b ON b.id = o.product_id
WHERE o.status IN ('completed','captured','paid','authorized');
