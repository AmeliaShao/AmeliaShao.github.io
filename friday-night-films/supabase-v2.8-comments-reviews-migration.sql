-- Friday Night Films V2.8
-- Run after V2.5+ all-in-one migration.
-- Adds personal review comments to ratings and a lightweight discussion thread for candidate films.

alter table public.ratings add column if not exists comment text check (comment is null or char_length(comment) <= 280);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  attendee_id uuid not null references public.attendants(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 220),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
drop policy if exists "comments readable by everyone" on public.comments;
drop policy if exists "comments insertable by everyone" on public.comments;
drop policy if exists "comments deletable by everyone" on public.comments;
create policy "comments readable by everyone" on public.comments for select to anon, authenticated using (true);
create policy "comments insertable by everyone" on public.comments for insert to anon, authenticated with check (true);
create policy "comments deletable by everyone" on public.comments for delete to anon, authenticated using (true);
do $$ begin alter publication supabase_realtime add table public.comments; exception when duplicate_object then null; end $$;
