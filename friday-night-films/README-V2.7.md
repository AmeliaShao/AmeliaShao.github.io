# V2.7 Archive click fix

- Archive submit button now has an explicit `type=submit` and stable ID.
- Replaced the fragile inline `onsubmit` handler with an explicit form submit listener.
- Archive update no longer uses `.single()`, avoiding a failure mode when PostgREST does not return exactly one row.
- Added clear validation/error messages and cache busting.
- No Supabase migration is required if V2.5 all-in-one migration has already been run.
