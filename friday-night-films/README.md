# Friday Night Films V2 — shared Supabase edition

## 1. Create the database tables
Open your Supabase project → **SQL Editor** → **New query**. Paste the complete contents of `supabase-schema.sql`, then click **Run**.

This creates `movies` and `votes`, enables Row Level Security, and enables realtime updates.

## 2. Publish to GitHub Pages
Replace the old site files in your GitHub repository with all files from this folder:
- `index.html`
- `style.css`
- `app.js`
- `config.js`

`supabase-schema.sql` and this README do not need to be hosted, though it is fine if they are.

## 3. Test
Open the site in two different browsers/devices. Add a movie on one. It should appear on the other; votes should sync too.

## Security note
The Supabase publishable key in `config.js` is intended to be public. Access is controlled by RLS policies. This V2 is deliberately a low-friction friend-group site: anyone with the URL can nominate, vote, and delete nominations. Add authentication before using it as a public site.

The TMDB API key is also visible because GitHub Pages is static. For a public/high-traffic deployment, move TMDB calls behind a serverless function.
