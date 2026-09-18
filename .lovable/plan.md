# Make the site faster on phones and computers

The site currently does far more work than it needs to on every visit: the home page asks the database for the whole clip library about five separate times, full-size pictures are downloaded even for tiny thumbnails, and some decorative motion runs constantly in the background even on phones. This plan speeds things up without changing how anything looks.

## 1. Stop re-fetching the whole library

- Fetch the clip list once per page load and reuse it for the anime counts, category counts, totals, popular searches and picks, instead of one full fetch per section.
- Ask the database only for the fields each screen actually shows, rather than every column of every clip.
- Use database counting and sorting for totals, "most downloaded" and per-anime/per-category counts instead of downloading everything and counting in code.
- Apply the anime / character / category / quality filters and the result limit in the database query, so browse and search pages only receive what they display.

Result: home, browse, anime and search pages load noticeably faster, especially on slow mobile connections.

## 2. Lighter images

- Serve thumbnails at the size they are actually displayed and let the browser pick a modern, smaller format.
- Give the first hero image priority so the main picture appears sooner, and load the other carousel pictures only when their slide comes up.
- Keep fixed picture proportions so text no longer shifts while images arrive.

## 3. Smoother on phones

- Skip the floating background sparkles and the slow rotating glow on small screens and for anyone who prefers less motion; keep them on larger screens.
- Only start the hover video preview after a short pause on the card, and never on touch devices, so scrolling stays smooth and no data is wasted.
- Trim heavy blur/shadow effects on small screens, keep the same look on desktop.
- Check that buttons and links are comfortably tappable and nothing overflows at phone width.

## 4. Load less code up front

- Load the admin area and the charts it uses only when an admin opens it, so ordinary visitors never download them.

## Verification

- Load home, browse, a clip page, an anime page and search on a phone-sized and desktop-sized screen, confirm nothing looks or behaves differently.
- Compare number of database requests and page weight before/after, and confirm no errors in the browser console.

## Technical notes

- Add a per-request memo in `src/data/repository.ts` for the published-clip query; replace repeated `listClips()` calls in `animeWithCounts`, `categoriesWithCounts`, `libraryStats`, `popularClips`, `popularSearches`, `relatedClips`.
- Replace `select("*")` with explicit column lists; move `eq`/`order`/`limit` filtering into the PostgREST query in `listClips`; use `head: true, count: "exact"` for totals and `order("download_count").gt(0)` for popular clips.
- `ClipCard`: `srcset`/`sizes` + `decoding="async"`, hover-preview behind a ~400 ms timer and a `(hover: hover)` media check.
- `HeroCarousel`: `fetchpriority="high"` + preload link in the home route `head().links` for the first slide; `loading="lazy"` for the rest.
- `AmbientBackground`: gate particles/rays on a `(min-width: 768px)` match in addition to the existing reduced-motion check.
- Route-level lazy import for `src/routes/admin.tsx` panels (`TrafficTab` recharts) via `React.lazy`.
- No schema changes, no new dependencies, no redesign.
