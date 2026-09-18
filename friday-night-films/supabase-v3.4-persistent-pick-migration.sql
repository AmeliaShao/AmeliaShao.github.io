alter table public.movie_night_settings
  add column if not exists selected_movie_id uuid references public.movies(id) on delete set null;
