# Visitor traffic stats you can trust (your own visits excluded)

## The problem

The built-in analytics count **every** visit to the published site, including
your own and every trip to `/admin`. There is no setting to exclude yourself,
so with only 5 visitors this week, your own browsing distorts the picture.

## What gets built

A new **Traffic** section in your admin dashboard that records and shows real
visitor activity, with your visits filtered out.

### What it records

Every page view on the public site, storing only non-personal signals:

- Which page was viewed
- Country (from the visitor's connection, no lookup service needed)
- Device type: mobile, tablet or desktop
- Where they came from: direct, search, social, or another site
- A daily rotating anonymous visitor marker, so the same person browsing five
  pages counts as one visitor that day

### What it never records

- Nothing from `/admin` or any admin page
- Nothing while you are signed in as admin
- No visits from your own browser once you mark it as "mine" (a one-click
  "Don't count my visits" toggle in the Traffic panel, remembered on that
  device)
- No IP addresses, no names, no emails, nothing that identifies a person

### What you see

The Traffic panel, with a 7 / 30 / 90 day switch:

- Visitors and page views per day, as a simple chart
- Totals for the period, with change vs the previous period
- Top pages
- Top countries
- Devices split
- Traffic sources
- Most viewed clips and most viewed anime pages
- Views compared with downloads, so you can see which clips get looked at but
  not downloaded

## Privacy note

Because it stores no personal data and no cross-site tracking, this needs no
cookie banner. The privacy page gets a short line saying anonymous visit counts
are collected, which keeps it accurate.

## Alternative worth knowing

Google Analytics could also do this and can filter your own traffic, but it
needs a cookie banner in Europe, adds a third-party script, and its own
dashboard. The in-app panel above keeps everything in one place with no banner.
Say the word if you'd rather go the Google Analytics route instead.

## Technical notes

- New `page_views` table in Lovable Cloud: `path`, `country`, `device`,
  `referrer_kind`, `visitor_hash`, `clip_id` (nullable), `created_at`.
  Insert-only for `anon`; SELECT restricted to admins via `has_role`.
- Recording goes through a server function so country comes from the request
  headers (`cf-ipcountry`) and the visitor hash is salted server-side with a
  daily-rotating salt — the raw IP is never stored.
- Fired once per route change from `__root.tsx`, skipping paths starting with
  `/admin`, skipping when a Supabase session with the admin role exists, and
  skipping when the local "don't count me" flag is set.
- Aggregates come from admin-only server functions using SQL `group by`, not
  by pulling every row to the browser.
- New `src/components/admin/TrafficTab.tsx` plus a nav entry in
  `src/routes/admin.tsx`, matching the existing tab pattern and design tokens.
- Charts reuse the existing `recharts` setup; no new dependencies.
