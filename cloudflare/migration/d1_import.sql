-- D1 import template.
-- Generate INSERT statements from an exported, trusted snapshot.
-- IDs are deliberately preserved so orders, payments, authors and books keep their relationships.
-- Do not run until the export has been independently validated.

PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- Import order:
-- 1. users
-- 2. authors
-- 3. books
-- 4. private_book_files
-- 5. orders
-- 6. payments
-- 7. testimonials
-- 8. authors_interest_submission
-- 9. layout_settings

COMMIT;
