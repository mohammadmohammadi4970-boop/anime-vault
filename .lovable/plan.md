# Fix "Unknown" countries and count downloads from shared links

## What I checked

Your traffic table holds 13 visits: 6 different people, mostly on mobile,
arriving from links you shared. Two of them were tagged Sweden; the rest have no
country at all. All nine clips still show 0 downloads.

So the visitors and page views in the panel are real — it's only the country tag
that is missing on most of them.

## Why the country says "Unknown"

The country is taken from one network signal attached to each request, and that
signal is not present on every visit that reaches your site. When it's absent
nothing is stored, and the panel shows "Unknown".

Fix:

- Read the country from several possible network signals instead of one.
- If none is present, look the country up once at the moment of the visit from
  the visitor's connection, keep only the two-letter country, and never store the
  address itself.
- If even that fails, label it "Not available" rather than "Unknown", so a
  genuine gap is distinguishable, plus a one-line note under the Countries card.
- Existing rows without a country stay as they are; only new visits benefit.

## Downloads: what is counted and what isn't

Downloads are counted in two places today — the small button on a clip card and
the download button on the clip page. Both work; the counts are 0 only because
nobody has downloaded since counting began.

Not counted: someone who already has the Google Drive link (copied, forwarded in
a chat, posted elsewhere) and downloads without touching your site. That download
happens on Google's servers, so nothing on your side can see it.

Fix for the part that can be fixed — a short counting link:

- New address `/d/<clip-slug>`: counts the download, then forwards straight to
  the Google Drive file.
- The share row on a clip page gains "Copy download link", which hands out this
  counting link instead of the raw Drive URL.
- Anyone using that link is counted even if they never open the site.

Drive URLs already shared in the past stay uncounted; nothing can recover those.

## Technical notes

- `recordPageView` country resolution order: `cf-ipcountry`,
  `x-vercel-ip-country`, `x-country-code`, then a single server-side geo lookup
  on the request IP (`cf-connecting-ip` / `x-forwarded-for`) with a short timeout
  and failure tolerance; the IP is used in-memory only and never persisted.
- Traffic panel labels stored `XX` as "Not available" and keeps
  `Intl.DisplayNames` for real codes.
- New public route `src/routes/d.$slug.tsx` with a GET server handler: resolves
  the published clip by slug through the publishable-key server client, calls
  `increment_download_count`, returns a 302 to `download_url`, 404 when the slug
  is unknown or unpublished.
- `ShareRow` in `src/routes/clips.$slug.tsx` gains "Copy download link" using
  `${origin}/d/${clip.slug}`.
- No schema changes, no new dependencies.
