# Friday Night Films V2.4

1. In Supabase > SQL Editor, run `supabase-v2.4-all-in-one-migration.sql` once. This includes the V2.2 archive changes and V2.3 ratings changes, so you do not need to run those separately.
2. Replace `index.html`, `style.css`, and `app.js` in GitHub with this version. Keep your existing `config.js` (the included one is unchanged).
3. Friday now shows `VOTE FOR TONIGHT`; Saturday–Thursday shows `VOTE FOR NEXT FRIDAY`.
4. When someone joins Attendants, this browser remembers their attendee ID. Their card shows `YOU`, the top button opens Edit, and archived-film ratings preselect their identity. Existing attendees can press `This is me` once to claim their identity on that device.

Identity is device/browser based (localStorage), not IP based and not authentication. Clearing browser storage or using another device requires pressing `This is me` again.
