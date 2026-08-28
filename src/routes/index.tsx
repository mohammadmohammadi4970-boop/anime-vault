import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import { ClipGrid } from "@/components/site/ClipCard";
import { SearchBar } from "@/components/site/SearchBar";
import { listAnime, listClips, popularSearches } from "@/data/repository";

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
    anime: await listAnime(),
    chips: await popularSearches(),
  }),
  component: Home,
});

function Home() {
  const { clips, anime, chips } = Route.useLoaderData();
  const animeNames = Object.fromEntries(anime.map((a) => [a.slug, a.name]));

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt="Cinematic anime night skyline artwork"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover object-right opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="eyebrow">Anime clips. Higher standards.</p>
          <h1 className="mt-5 font-display text-5xl leading-[0.95] font-bold sm:text-6xl lg:text-7xl">
            KURAGAWA
            <br />
            <span className="text-primary-soft">CLIPS</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            High-quality anime clips for editors, creators and fans. Find, download and create
            something extraordinary.
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

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {[
              ["1000+", "Clips planned"],
              ["50+", "Anime"],
              ["Always", "Free"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-xl font-bold">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-border bg-surface/30" aria-label="Search clips">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <SearchBar chips={chips} />
        </div>
      </section>

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
    </main>
  );
}
