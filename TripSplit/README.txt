TripSplit Lite cloud version

1. Open your NEW Supabase project at https://supabase.com/dashboard
2. SQL Editor > New query. Paste the ENTIRE contents of setup.sql, then click Run.
3. Open index.html in Chrome to test. It contains the Supabase URL and publishable key.
4. To publish: in GitHub repository AmeliaShao.github.io, replace TripSplit/index.html with this index.html. Other old React files can remain unused; GitHub Pages must be enabled to serve from main /root.
5. First user: enter nickname > create room > copy invitation code. Second user: enter nickname > enter invitation code. Existing rooms for that nickname appear when you return.
6. The app fetches room state on entering and via the Sync button. It does not push realtime updates automatically; refresh/sync to see other people's changes.

IMPORTANT: Username is NOT a password. Anyone who knows a nickname can list that nickname's rooms and impersonate them. This version is only for trusted friends and non-sensitive expenses. Invitation code is not a security boundary for known usernames. Do not use this for sensitive financial records. No account recovery, moderation, or production-grade audit guarantees.

IMPORTANT: Edits use whole-room snapshots with optimistic concurrency. If two people edit simultaneously, one update will be rejected and the client will reload the latest room. The rejected edit must be re-entered.

Database SQL must be executed by the project owner. The provided publishable key cannot execute schema changes.
