-- Friday Night Films V2.2: Archive
alter table public.movies add column if not exists watched_at date;
alter table public.movies add column if not exists group_rating numeric(2,1);
alter table public.movies add column if not exists archive_note text;

-- Existing RLS policies from V2 already allow public updates.
-- If your project was created differently, ensure the publishable role can update movies.
