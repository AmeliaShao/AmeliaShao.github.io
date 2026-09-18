-- Friday Night Films V2 — run this entire file once in Supabase > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  tmdb_id bigint not null unique,
  title text not null,
  poster_url text,
  release_year int,
  genres text,
  submitted_by text not null,
  reason text not null,
  status text not null default 'candidate' check (status in ('candidate','watched')),
  movie_night_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  unique(movie_id, voter_id)
);

alter table public.movies enable row level security;
alter table public.votes enable row level security;

-- Public friend-group site: anyone with the URL can read and nominate.
drop policy if exists "public read movies" on public.movies;
create policy "public read movies" on public.movies for select to anon, authenticated using (true);
drop policy if exists "public add movies" on public.movies;
create policy "public add movies" on public.movies for insert to anon, authenticated with check (true);
-- V2 keeps the remove button. Anyone with the site URL can remove a nomination.
drop policy if exists "public delete movies" on public.movies;
create policy "public delete movies" on public.movies for delete to anon, authenticated using (true);

drop policy if exists "public read votes" on public.votes;
create policy "public read votes" on public.votes for select to anon, authenticated using (true);
drop policy if exists "public add votes" on public.votes;
create policy "public add votes" on public.votes for insert to anon, authenticated with check (true);

-- Allow realtime subscriptions to these tables.
do $$ begin
  alter publication supabase_realtime add table public.movies;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.votes;
exception when duplicate_object then null; end $$;
