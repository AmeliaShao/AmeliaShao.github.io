-- Friday Night Films V3.1: weekly rollover + Tonight's Lineup
alter table public.movies add column if not exists weeks_waiting integer not null default 0;
alter table public.movies add column if not exists ballot_date date;

create table if not exists public.movie_night_settings (
  id integer primary key default 1 check (id = 1),
  start_time time,
  location text,
  food text,
  group_note text,
  updated_at timestamptz not null default now()
);
insert into public.movie_night_settings (id) values (1) on conflict (id) do nothing;

alter table public.movie_night_settings enable row level security;
drop policy if exists "public read settings" on public.movie_night_settings;
create policy "public read settings" on public.movie_night_settings for select using (true);
drop policy if exists "public update settings" on public.movie_night_settings;
create policy "public update settings" on public.movie_night_settings for update using (true) with check (true);
drop policy if exists "public insert settings" on public.movie_night_settings;
create policy "public insert settings" on public.movie_night_settings for insert with check (true);

-- Ensure candidate rollover updates are permitted.
drop policy if exists "public update movies" on public.movies;
create policy "public update movies" on public.movies for update using (true) with check (true);

-- Rollover needs to clear old votes.
drop policy if exists "public delete votes" on public.votes;
create policy "public delete votes" on public.votes for delete using (true);

-- Add settings to realtime publication when possible.
do $$ begin
  alter publication supabase_realtime add table public.movie_night_settings;
exception when duplicate_object then null;
end $$;
