# Friday Night Films V2.9

Adds two front-end-only features; no Supabase migration is required.

- Genre filter on This week's picks, generated from the TMDB genres already stored on each movie.
- RANDOMIZER section with a weighted wheel.
- Wheel weight = votes + 1, so every film can still be selected while higher-voted films occupy a larger slice.
- The wheel has its own genre filter, so Horror (or any other genre) can be excluded by choosing another genre before spinning.

Upload/replace `index.html`, `style.css`, and `app.js` in GitHub Pages. Keep your existing `config.js`.
