-- Allow authenticated users to review individual books.
-- Existing homepage testimonials remain valid because book_id/user_id are nullable.
alter table public.testimonials
  add column if not exists book_id text,
  add column if not exists user_id uuid;

create index if not exists testimonials_book_id_idx
  on public.testimonials (book_id);

create index if not exists testimonials_user_id_idx
  on public.testimonials (user_id);

create unique index if not exists testimonials_one_review_per_user_per_book_idx
  on public.testimonials (user_id, book_id)
  where user_id is not null and book_id is not null;
