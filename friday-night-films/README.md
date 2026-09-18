# Friday Night Films — V1.1

A tiny movie-night ballot for friends.

## What's new
- Search movies while suggesting a film.
- TMDB automatically supplies poster, title and year.
- Click any poster/title to open a Douban movie search for that film.
- Voting and submissions still persist locally in the browser for this prototype.

## 1. Get a free TMDB API key
Create/log into a TMDB account, go to Account Settings > API, request an API key, then copy the **v3 API Key**.

Open `config.js` and paste it here:

    window.FNF_CONFIG = { TMDB_API_KEY: 'YOUR_KEY_HERE' };

For this static prototype the key is necessarily visible to visitors. Before a public production launch, move TMDB calls behind a serverless/API function if you want the credential kept off the client.

## 2. Run
For reliable API requests, serve the folder rather than double-clicking the HTML file. For example:

    python3 -m http.server 8000

Then visit http://localhost:8000

GitHub Pages will also work for this prototype.

## Douban behavior
The site does **not** scrape or hotlink Douban. Cards open Douban's movie search using the movie title + year. This is more robust than trying to scrape Douban posters from a static browser app. Posters come from TMDB.

## Next step
Replace localStorage with Supabase so everyone sees the same suggestions and votes.


## V1.2
- TMDB API key configured.
- Selecting a movie now also fetches its genres from TMDB.
- Poster/title still link to a Douban movie search for a robust fallback.

## Next: shared database
To make submissions and votes sync across friends, create a Supabase project and provide the Project URL and anon/publishable key. Do not provide the service_role/secret key.
