# V3.4 — Persistent weekly pick

- The wheel result is now saved in Supabase as this week's pick.
- The result stays visible after refresh and syncs to friends' devices.
- Tonight's Lineup shows the selected film with poster and metadata.
- Re-spinning replaces the current weekly pick.
- Archiving the selected film clears the pick; starting next week's ballot also clears it.

Run `supabase-v3.4-persistent-pick-migration.sql` once, then replace `index.html`, `style.css`, and `app.js` on GitHub Pages. Keep your existing `config.js`.
