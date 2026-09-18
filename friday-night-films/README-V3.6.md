# V3.6 — full weekly reset

Run `supabase-v3.6-week-reset-migration.sql` once in Supabase SQL Editor.

When you archive a film, the existing rollover confirmation now starts the new week by:
- keeping un-watched candidate films
- resetting their votes
- keeping movie comments
- increasing `weeks_waiting`
- clearing the current attendee roster without deleting historical attendee identities/reviews/comments
- clearing lineup time, location, food, group note, and selected movie
- advancing the persisted ballot date by exactly 7 days

The top-right date now reads from the persisted ballot date, so after rollover it immediately jumps to the next Friday instead of recalculating from the browser date.
