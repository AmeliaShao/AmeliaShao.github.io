-- Run this later in Supabase SQL Editor when you create the project.
create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  tmdb_id bigint not null unique,
  title text not null,
  poster_url text,
  release_year int,
  genres text,
  submitted_by text not null,
  reason text not null,
  votes int not null default 0,
  status text not null default 'candidate' check (status in ('candidate','watched')),
  movie_night_date date,
  created_at timestamptz not null default now()
);
