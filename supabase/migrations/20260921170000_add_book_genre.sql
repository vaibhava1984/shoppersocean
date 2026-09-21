alter table public.books add column if not exists genre text;

create index if not exists books_genre_idx on public.books (genre);

comment on column public.books.genre is 'Book category/genre used by the bookshelf genre filter';