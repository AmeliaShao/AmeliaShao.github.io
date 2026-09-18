-- Friday Night Films V2.1 — run this ONCE in Supabase > SQL Editor

create table if not exists public.attendants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  emoji text not null default '🍿',
  note text check (note is null or char_length(note) <= 80),
  created_at timestamptz not null default now()
);

alter table public.attendants enable row level security;

drop policy if exists "public read attendants" on public.attendants;
create policy "public read attendants" on public.attendants for select to anon, authenticated using (true);
drop policy if exists "public add attendants" on public.attendants;
create policy "public add attendants" on public.attendants for insert to anon, authenticated with check (true);
drop policy if exists "public delete attendants" on public.attendants;
create policy "public delete attendants" on public.attendants for delete to anon, authenticated using (true);

do $$ begin
  alter publication supabase_realtime add table public.attendants;
exception when duplicate_object then null; end $$;
