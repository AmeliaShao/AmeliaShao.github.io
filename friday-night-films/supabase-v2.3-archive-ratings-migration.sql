-- Friday Night Films V2.3: Archive + individual attendee ratings
-- Safe to run even if you already ran the V2.2 archive migration.
alter table public.movies add column if not exists watched_at date;
alter table public.movies add column if not exists group_rating numeric(2,1);
alter table public.movies add column if not exists archive_note text;

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  attendee_id uuid not null references public.attendants(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  created_at timestamptz not null default now(),
  unique(movie_id, attendee_id)
);
alter table public.ratings enable row level security;
drop policy if exists "ratings readable by everyone" on public.ratings;
drop policy if exists "ratings insertable by everyone" on public.ratings;
drop policy if exists "ratings updateable by everyone" on public.ratings;
create policy "ratings readable by everyone" on public.ratings for select using (true);
create policy "ratings insertable by everyone" on public.ratings for insert with check (true);
create policy "ratings updateable by everyone" on public.ratings for update using (true) with check (true);
alter publication supabase_realtime add table public.ratings;
