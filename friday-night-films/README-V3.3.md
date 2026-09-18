# V3.3 — Mobile layout pass

No Supabase migration needed.

Changes:
- Wheel is constrained to the phone viewport and stays fully visible.
- Randomizer switches to a true stacked mobile layout.
- Spin button and randomizer controls use full mobile width.
- Genre chips remain horizontally scrollable without forcing page overflow.
- Sticky navigation scrolls horizontally on narrow screens.
- Main/header side padding is reduced on phones.
- Movie grid becomes one column on very narrow phones.
- Attendants become two columns on very narrow phones.
- Dialogs fit within the mobile viewport and can scroll internally.

Replace index.html, style.css, and app.js on GitHub. Keep config.js unchanged.
