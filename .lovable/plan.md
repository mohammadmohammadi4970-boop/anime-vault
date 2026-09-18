# Fix "Unknown" countries and count downloads from shared links

## What I checked

Your traffic rows so far: 11 visits recorded as unknown, 1 from Sweden. All nine
clips show a download count of 0.

## Why countries say "Unknown"

The country comes from a signal the hosting network attaches to each visit. That
signal exists for real visitors on your published site (that's the Sweden row),
but it is missing when the page is opened inside the Lovable editor preview or
from this development environment — which is exactly where those 11 visits came
from (Sep 17, 11:00–16:09, my own test visits included). So the "Unknown" rows
are test traffic, not broken tracking.

Still, it should never be a silent hole. Changes:

- Read the country from several possible network signals instead of just one, so
  more hosting paths are covered.
- When no signal is present at all, record it as a clearly separate label:
  "Not available (preview/local)" instead of "Unknown", so you can tell a
  missing signal apart from a real unrecognised country.
- Show a one-line note under the Countries card explaining that preview and
  editor visits have no country.
- Optionally (say the word) clear the 11 test rows so the panel starts from real
  visitors only.

## Downloads: what's counted today and what's missing

Right now a download is counted in two places — the small button on a clip card
and the download button on the clip page. Both work; the counts are 0 simply
because nobody has downloaded since counting started.

What is NOT counted: when someone has the Google Drive link itself (copied,
shared in a chat, posted elsewhere) and downloads without touching your site.
Nothing on your side can see that — the file is served by Google, not you.

Fix for the part that can be fixed: a short counting link.

- New address `/d/<clip-slug>`: counts the download, then immediately forwards
  to the Google Drive file.
- The "Copy link" / share options on a clip page get an extra "Copy download
  link" that hands out this counting link.
- Anyone who uses that link is counted, even if they never open your site.

Direct Drive URLs already shared in the past stay uncounted — nothing can
recover those.

## Technical notes

- `recordPageView` reads `cf-ipcountry`, then `x-vercel-ip-country`, then
  `x-country-code`; when none is present, stores `XX` and the Traffic panel
  labels `XX` as "Not available (preview/local)". Two-letter real codes keep
  resolving through `Intl.DisplayNames`.
- New public route `src/routes/d.$slug.tsx` with a GET server handler: looks up
  the published clip by slug through the publishable-key server client, calls
  `increment_download_count`, and returns a 302 to `download_url`; 404 page when
  the slug is unknown or unpublished.
- `ShareRow` in `src/routes/clips.$slug.tsx` gains a "Copy download link"
  action pointing at `${origin}/d/${clip.slug}`.
- No schema changes, no new dependencies.
