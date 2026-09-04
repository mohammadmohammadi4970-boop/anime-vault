import { Link, createFileRoute } from "@tanstack/react-router";

import { ClipGrid } from "@/components/site/ClipCard";
import { HeroCarousel, pickFeatured } from "@/components/site/HeroCarousel";
import { PromoBanner } from "@/components/site/PromoBanner";
import { Reveal } from "@/components/site/Reveal";
import { SearchBar } from "@/components/site/SearchBar";
import {
  animeWithCounts,
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
    clips: await listClips({ limit: 10 }),
    anime: await animeWithCounts(),
    chips: await popularSearches(),
    stats: await libraryStats(),
    popular: await popularClips(5),
  }),
  component: Home,
});

function Home() {
  const { clips, anime, chips, stats, popular } = Route.useLoaderData();
  const animeNames = Object.fromEntries(anime.map((a) => [a.slug, a.name]));
  const featured = pickFeatured(anime);

  return (
    <main>
      <HeroCarousel anime={featured} stats={stats} />

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

      <PromoBanner />
    </main>
  );
}
