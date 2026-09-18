-- Friday Night Films V2.4 — all-in-one upgrade from V2 / V2.1.
-- Includes Archive (V2.2), individual ratings (V2.3), and editable attendants (V2.4).

create table if not exists public.attendants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  emoji text not null default '🍿',
  note text check (note is null or char_length(note) <= 80),
  created_at timestamptz not null default now()
);
alter table public.attendants enable row level security;
drop policy if exists "public read attendants" on public.attendants;
drop policy if exists "public add attendants" on public.attendants;
drop policy if exists "public update attendants" on public.attendants;
drop policy if exists "public delete attendants" on public.attendants;
create policy "public read attendants" on public.attendants for select to anon, authenticated using (true);
create policy "public add attendants" on public.attendants for insert to anon, authenticated with check (true);
create policy "public update attendants" on public.attendants for update to anon, authenticated using (true) with check (true);
create policy "public delete attendants" on public.attendants for delete to anon, authenticated using (true);

do $$ begin alter publication supabase_realtime add table public.attendants; exception when duplicate_object then null; end $$;

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
create policy "ratings readable by everyone" on public.ratings for select to anon, authenticated using (true);
create policy "ratings insertable by everyone" on public.ratings for insert to anon, authenticated with check (true);
create policy "ratings updateable by everyone" on public.ratings for update to anon, authenticated using (true) with check (true);
do $$ begin alter publication supabase_realtime add table public.ratings; exception when duplicate_object then null; end $$;
