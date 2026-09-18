-- V3.6 weekly reset: preserve historical attendee identities while resetting the current roster
alter table public.attendants
  add column if not exists active boolean not null default true;

alter table public.movie_night_settings
  add column if not exists current_ballot_date date;

-- Initialize the current ballot date to the next Friday (or today if today is Friday).
update public.movie_night_settings
set current_ballot_date = (current_date + ((5 - extract(dow from current_date)::int + 7) % 7))::date
where id = 1 and current_ballot_date is null;

-- Existing attendees are treated as this week's current roster.
update public.attendants set active = true where active is null;
