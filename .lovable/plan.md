# Kuragawa Clips — UX Enhancements

## What's changing

Four confirmed features plus two small polish items the user agreed to hear about.

---

## 1. Small download button on clip cards

**Where:** `src/components/site/ClipCard.tsx`

Add a small download icon button in the thumbnail overlay (top-left corner, opposite the duration badge). It links directly to `clip.downloadUrl` and fires `increment_download_count` on click — same behavior as the clip page download button.

Design rules:
- Small: ~28px, subtle `bg-background/70 backdrop-blur` pill, just a `Download` icon (no text).
- Appears on hover only (desktop) or always visible (mobile) so it doesn't compete with the thumbnail.
- Doesn't open the clip detail page — goes straight to Google Drive.
- The entire card is still clickable to the detail page; the download button uses `e.preventDefault()` + `e.stopPropagation()` to avoid navigation.

---

## 2. Share buttons on clip pages

**Where:** `src/routes/clips.$slug.tsx`

Add a compact share row below the download button, containing:
- **Copy link** — copies the current clip page URL to clipboard, shows "Copied!" feedback for 2 seconds.
- **X / Twitter** — opens `https://twitter.com/intent/tweet?url=<clip-url>&text=<clip-title>`
- **Discord** — copies the URL (Discord doesn't have a native share URL; the copy + toast covers this).

Design rules:
- Small, muted text buttons with icons — `h-9 px-3 text-xs text-muted-foreground`.
- No large social-share blocks; blends into the page.

---

## 3. Load More on Browse

**Where:** `src/routes/browse.tsx`

Replace the "render all clips at once" behavior with progressive loading:
- Show first 12 clips after filtering.
- A "Load More" button below the grid appends the next 12 each click.
- Button shows "Showing X of Y" and hides when all clips are visible.
- Reset to 12 when filters/search/sort change (so users don't see stale paginated results from a different filter set).

No new data fetching — still uses the existing loader. Purely client-side slicing of the already-filtered array.

---

## 4. Recently Added section on homepage

**Where:** `src/routes/index.tsx`

Add a "Recently Added" section between the search bar and the "Latest Clips" section:
- Shows the 6 newest clips (sorted by `createdAt` desc, excluding any already shown in Popular Clips).
- Uses the existing `ClipGrid` component.
- Always renders content (unlike Popular Clips which only shows when downloads exist).
- Relabels the existing "Latest Clips" section to "Browse All" since it now overlaps less.

---

## 5. Remove the "For / Creators" placeholder stat

**Where:** `src/components/site/HeroCarousel.tsx`

The hero stat bar currently ends with a "For / Creators" entry that reads like an unfinished placeholder next to the real Clips / Anime / Quality numbers. Remove it, leaving the three genuine stats. No download numbers are shown anywhere.

---

## Not included

Download counts stay hidden everywhere — not on cards, not on clip pages, not in the hero stats. Click tracking still records in the background as it does today, so the Popular Clips ranking keeps working; the numbers are just never displayed.

---

## Files touched

| File | Change |
|------|--------|
| `src/components/site/ClipCard.tsx` | Small hover download button on cards |
| `src/routes/clips.$slug.tsx` | Share buttons (copy link / X / Discord) |
| `src/routes/browse.tsx` | Load More progressive loading |
| `src/routes/index.tsx` | Recently Added section |
| `src/components/site/HeroCarousel.tsx` | Remove placeholder stat |

No database migrations, no new dependencies, no design changes, no new routes.
