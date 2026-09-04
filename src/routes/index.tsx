import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { ClipGrid } from "@/components/site/ClipCard";
import { HeroCarousel, pickFeatured } from "@/components/site/HeroCarousel";
import { Reveal } from "@/components/site/Reveal";
import { SearchBar } from "@/components/site/SearchBar";
import {
  animeWithCounts,
  homepageContent,
  libraryStats,
  listClips,
  popularClips,
  popularSearches,
} from "@/data/repository";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kuragawa Clips — Anime clips. Higher standards." },
      {
        name: "description",
        content:
          "A premium anime clip library for editors and creators. Find, preview and download high-quality anime clips by anime, character, scene or category.",
      },
      { property: "og:title", content: "Kuragawa Clips — Anime clips. Higher standards." },
      {
        property: "og:description",
        content: "High-quality anime clips for editors, creators and fans.",
      },
    ],
  }),
  loader: async () => ({
    content: await homepageContent(),
    clips: await listClips({ limit: 10 }),
    anime: await animeWithCounts(),
    chips: await popularSearches(),
    stats: await libraryStats(),
    popular: await popularClips(5),
  }),
  component: Home,
});

function Home() {
  const { content, clips, anime, chips, stats, popular } = Route.useLoaderData();
  const animeNames = Object.fromEntries(anime.map((a) => [a.slug, a.name]));
  const featured = pickFeatured(anime);

  return (
    <main>
      {featured.length > 0 ? (
        <HeroCarousel anime={featured} tagline={content.heroTagline} stats={stats} />
      ) : (
        <section className="relative overflow-hidden border-b border-border">
          <img
            src={content.heroImageUrl || heroImage}
            alt="Cinematic anime night skyline artwork"
            width={1920}
            height={1088}
            className="absolute inset-0 h-full w-full object-cover object-right opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <p className="eyebrow">{content.heroTagline}</p>
            <h1 className="mt-5 font-display text-5xl leading-[0.95] font-bold sm:text-6xl lg:text-7xl">
              {content.heroHeading}
              <br />
              <span className="text-primary-soft">{content.heroHeadingAccent}</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {content.heroDescription}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/85 hover:glow-ring"
              >
                Browse Clips <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-xl border border-border-strong bg-surface/70 px-5 py-3 text-sm font-medium transition-colors hover:bg-surface"
              >
                About Us
              </Link>
            </div>

            <p className="mt-12 text-sm text-muted-foreground">{content.heroNote}</p>
          </div>
        </section>
      )}

      <section className="border-b border-border bg-surface/30" aria-label="Search clips">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <SearchBar chips={chips} />
        </div>
      </section>

      {popular.length > 0 ? (
        <Reveal>
          <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
            <p className="eyebrow">Trending now</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Popular Clips</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The most downloaded clips, ranked by real activity.
            </p>
            <div className="mt-8">
              <ClipGrid clips={popular} animeNames={animeNames} />
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <p className="eyebrow">Explore</p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Latest Clips</h2>
            </div>
            <Link
              to="/browse"
              className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          </div>

          <div className="mt-8">
            <ClipGrid clips={clips} animeNames={animeNames} />
          </div>
        </section>
      </Reveal>
    </main>
  );
}
