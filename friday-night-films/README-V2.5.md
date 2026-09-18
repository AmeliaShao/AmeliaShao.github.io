# Friday Night Films V2.5

Archive hotfix + all V2.2/V2.3/V2.4 features.

## Important
Run `supabase-v2.5-all-in-one-migration.sql` in Supabase > SQL Editor.
The key fix is an UPDATE policy for the `movies` table. Without it, Supabase blocks moving a movie from `candidate` to `watched`.

Then replace `index.html`, `style.css`, and `app.js` on GitHub. `config.js` can stay as-is.

The ARCHIVE item remains in the sticky top navigation, and every candidate movie now always shows `ARCHIVE THIS FILM ->`.
