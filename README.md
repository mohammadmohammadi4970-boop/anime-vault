# Anime Vault

Build a production-quality web application called "Kuragawa Clips".

IMPORTANT:

This is NOT a simple landing-page mockup. Build the foundation of a real anime clip library that will later have a database, smart search, individual clip pages, and a private admin dashboard for managing clips.

Do not use hardcoded pages for individual clips. The architecture must be data-driven so I can eventually add hundreds of clips without changing the website code.

==================================================

BRAND

==================================================

Name:

KURAGAWA CLIPS

Tagline:

Anime clips. Higher standards.

The website is an anime clip discovery/download library.

The site must support ANY anime, ANY character, ANY scene, and ANY category. Do not design the application around a specific anime or character.

==================================================

VISUAL DESIGN

==================================================

Create a premium dark anime-media aesthetic.

Use:

- Very dark charcoal/black background

- Purple/lavender accent color

- White/off-white typography

- Cinematic anime artwork

- Modern premium typography

- Rounded cards

- Subtle borders

- Soft purple glow effects

- Large visual sections

- Generous spacing

- Clean hierarchy

- Subtle hover animations

- Smooth transitions

- Responsive desktop/tablet/mobile layouts

The design should feel like a premium modern media platform, NOT:

- a generic WordPress site

- a basic template

- a file directory

- a cheap download site

- an overly neon gamer website

Use the visual reference I provided as the primary design inspiration.

==================================================

TECHNOLOGY

==================================================

Use a modern maintainable stack.

Preferred:

- React

- TypeScript

- Tailwind CSS

- Next.js if supported by the project environment

- Supabase architecture for the future database/authentication

- Clean component-based architecture

Do not add unnecessary libraries.

Keep the project easy to maintain.

==================================================

GLOBAL HEADER

==================================================

Create a polished responsive header.

Desktop:

Left:

KURAGAWA CLIPS

Navigation:

Home

Browse

Anime

Categories

Right:

Search icon / search access

Mobile:

Logo

Search

Menu button

The header should feel premium and minimal.

==================================================

HOMEPAGE

==================================================

Route:

/

Create a cinematic hero section.

Hero text:

KURAGAWA

CLIPS

Anime clips. Higher standards.

Primary CTA:

Browse Clips

Use a large cinematic anime visual/background.

Do not use a specific copyrighted anime character as a permanent hardcoded hero unless an image is supplied by me. Use an appropriate placeholder/visual treatment that can easily be replaced later.

==================================================

HOMEPAGE SEARCH

==================================================

Place a large prominent search bar below/integrated with the hero.

Placeholder:

Search for anime, characters, scenes...

Below it show clickable popular search chips such as:

Gojo

Okarun

Deku

Itachi

Luffy

Ichigo

These are only examples.

The final system must generate/configure these dynamically later.

==================================================

LATEST CLIPS

==================================================

Create:

LATEST CLIPS

Display clips in a premium responsive card grid.

Each card should contain:

- Thumbnail

- Title

- Anime

- Character if available

- Duration

- Quality

Cards should have subtle hover animations.

Do not make the cards oversized.

The grid should look good with only 10-12 clips initially while remaining scalable to hundreds.

==================================================

BROWSE PAGE

==================================================

Create:

/browse

This page will eventually display all clips.

Include UI for:

- Search

- Anime filter

- Character filter

- Category filter

- Quality filter

- Sort by newest

- Sort by oldest

- Sort A-Z

For now, build the UI and architecture cleanly.

==================================================

SEARCH PAGE

==================================================

Create:

/search

The future search system must be capable of searching:

- title

- anime

- character

- character aliases

- anime aliases

- tags

- category

For example, if a clip has:

Title:

Okarun Transformation

Anime:

Dandadan

Character:

Okarun

Alias:

Ken Takakura

Tags:

Transformation, Fight, Dandadan

Then searching:

Okarun

Dandadan

Ken Takakura

Transformation

Fight

should all be capable of finding the clip.

This must eventually be database-driven.

==================================================

ANIME DIRECTORY

==================================================

Create:

/anime

Display anime represented in the clip database.

Each anime card should eventually contain:

- Anime artwork

- Anime name

- Number of clips

Anime pages must be dynamically generated.

==================================================

ANIME PAGE

==================================================

Create the architecture for:

/anime/[slug]

An anime page should eventually display:

- Anime name

- Number of clips

- Description

- Related clips

- Character filtering

Do not manually create individual anime pages.

==================================================

CATEGORIES

==================================================

Create:

/categories

Example categories:

Fights

Transformations

Powers

Emotional

Characters

Scenes

Aesthetic

Action

These are examples only.

Categories must eventually be manageable through the admin system.

==================================================

CLIP PAGE

==================================================

Create the architecture for dynamic clip pages:

/clips/[slug]

A clip page should eventually look like:

Back to Browse

CLIP TITLE

Anime • Character

[ Screenshot 1 ]

[ Screenshot 2 ]

[ Screenshot 3 ]

DOWNLOAD CLIP

Then lightweight information:

Anime

Character

Category

Duration

Quality

Format

Then:

Tags

Then:

You May Also Like

IMPORTANT:

There will NOT be a video player on the clip page.

The actual MP4 will eventually remain on Google Drive.

The clip page only shows 2-3 screenshots and metadata.

==================================================

DOWNLOAD MODEL

==================================================

Each clip will eventually contain a Google Drive download URL.

The website should NOT host the full downloadable MP4.

The Download Clip button will eventually redirect the visitor to the corresponding Google Drive URL.

Do not hardcode a single Drive link.

The link must come from the clip's database record.

==================================================

DATA ARCHITECTURE

==================================================

Design the application so that clips are data-driven.

A clip will eventually contain:

id

title

slug

anime

character

aliases

tags

category

description

thumbnail

screenshots

duration

resolution

format

downloadUrl

published

createdAt

updatedAt

Anime and categories should be separate entities where appropriate.

The public website should read from this data rather than hardcoding individual clip pages.

==================================================

ADMIN DASHBOARD — ARCHITECTURE

==================================================

The final application MUST have a private admin dashboard.

Route:

/admin

The purpose is that I can add new clips WITHOUT asking Lovable or editing source code.

The future dashboard must contain:

Dashboard

Add New Clip

Edit Clip

Delete Clip

Publish/Unpublish

Manage Anime

Manage Categories

Manage Tags/Aliases

The Add Clip form should eventually contain:

Title

Anime

Character

Aliases

Tags

Category

Description

Thumbnail

2-3 Screenshots

Google Drive URL

Duration

Resolution

Format

Draft/Published

Do not fully implement authentication/database unless needed for this initial phase, but architect the application so this can be added cleanly.

==================================================

IMPORTANT FUTURE WORKFLOW

==================================================

My eventual workflow must be:

Create clip

→ Upload MP4 to Google Drive

→ Create thumbnail

→ Take 2-3 screenshots

→ Open Kuragawa Admin

→ Add New Clip

→ Enter metadata

→ Paste Drive link

→ Publish

I should NOT need to modify source code for normal clip uploads.

I should NOT need to ask the AI to create a new webpage for every clip.

==================================================

PAGES

==================================================

Create the foundation for:

/

 /browse

 /search

 /anime

 /categories

 /clips/[slug]

 /anime/[slug]

 /about

 /contact

 /privacy

 /terms

 /admin

Legal pages can initially contain clean placeholders for content that I will customize later.

==================================================

RESPONSIVENESS

==================================================

Make the website excellent on:

- desktop

- laptop

- tablet

- mobile

Do not simply shrink desktop layouts.

Mobile navigation, search, clip cards, screenshot galleries, filters, and buttons should be deliberately designed.

==================================================

PERFORMANCE

==================================================

Prioritize:

- fast loading

- optimized images

- lazy loading where appropriate

- minimal unnecessary JavaScript

- clean component structure

- responsive images

- accessible HTML

==================================================

ACCESSIBILITY

==================================================

Use:

- semantic HTML

- keyboard-accessible controls

- visible focus states

- proper labels

- useful alt text

- good contrast

==================================================

IMPORTANT DEVELOPMENT RULE

==================================================

Do NOT create a fake demo that only looks functional.

Build the foundation as a real application.

However, work in phases rather than trying to implement the entire backend in one step.

For THIS FIRST PHASE:

1. Create the project structure.

2. Build the visual design.

3. Build the homepage.

4. Build the header/footer.

5. Build the search UI.

6. Build the clip card component.

7. Build Browse.

8. Build the basic Anime and Categories pages.

9. Build the visual structure of the clip page.

10. Make everything responsive.

11. Create clean reusable components.

12. Prepare the architecture for Supabase/database integration.

Do NOT add fake hundreds of clips.

Use a small number of clearly marked sample clips only to demonstrate the UI.

Do NOT hardcode the final system around those examples.

==================================================

VERY IMPORTANT

==================================================

The visual quality is extremely important.

I already have a dark/purple Kuragawa Clips visual reference.

Match that aesthetic closely.

Do not make it look like a generic AI-generated dashboard.

It should feel like a real premium website that could eventually become a large anime clip library.

After completing this first phase, STOP.

Tell me:

1. What you built

2. What files/components were created

3. What is currently functional

4. What remains for Phase 2

Do not move to the database/admin implementation until I explicitly ask you to continue.
I am attaching a visual reference for the Kuragawa Clips website. Use this image as the primary visual/design reference. Recreate its overall layout, visual hierarchy, dark color palette, purple accents, typography, spacing, card styling, hero treatment, and premium aesthetic. Do not copy any specific artwork or text from the reference; use it only as the UI/visual direction

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ceec23f4-76d4-4676-8ac8-c5a1b8c4586f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
