# Homepage — remove the duplicate, surface "Most Downloaded"

## Problem
The homepage shows two near-identical sections: "Recently Added" (newest clips) and "Latest Clips" (also newest clips). With a small library they show the exact same cards; even as it grows both are date-sorted, so they overlap heavily.

## What changes

### 1. Remove the duplicate "Latest Clips" section
Delete the "Latest Clips" section from `src/routes/index.tsx`. Move its "View all → /browse" link onto the "Recently Added" section so there's still a clear path to the full browse page.

Homepage becomes: Hero → Search → Recently Added → Most Downloaded → PromoBanner.

### 2. Surface "Most Downloaded" (the existing Popular Clips section)
The site already has a "Popular Clips" section ranked by real `download_count`. Today it's hidden because no clips have been downloaded yet (no traffic). Change it so it's always visible and clearly labeled "Most Downloaded":

- Relabel eyebrow `Trending now` → `Most downloaded`, heading `Popular Clips` → `Most Downloaded Clips`.
- When the list is **empty** (no downloads yet), render a small graceful empty state instead of hiding the section: a muted line like "No downloads yet — popular clips will appear here once the community starts downloading." plus a "Browse all clips" link to `/browse`. This keeps the section visibly present as the user requested, and it fills with real data automatically once traffic starts today.
- When the list has clips, render the existing `ClipGrid` as today (no download numbers shown, per the existing rule).

This is honest — it never fakes popularity. It just stops hiding the section before downloads exist.

### 3. "Most Searched" — already present, no change
The SearchBar already shows "Popular:" chips (popular searches) derived from tags/admin config. That covers "Most Searched" without a duplicate section. No new work.

## Files touched
| File | Change |
|------|--------|
| `src/routes/index.tsx` | Remove "Latest Clips" section; add View-all link to Recently Added; relabel Popular Clips → Most Downloaded; add empty state |

No database migrations, no new dependencies, no design changes, no new routes. Download counts stay hidden everywhere; tracking keeps running in the background as today.
