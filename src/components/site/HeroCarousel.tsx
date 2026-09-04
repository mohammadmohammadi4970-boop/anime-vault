import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import heroPrimary from "@/assets/hero-primary.jpg";
import type { Anime } from "@/data/types";

const AUTO_ADVANCE_MS = 5000;
const MAX_ANIME_SLIDES = 6;

export type FeaturedAnime = Anime & { clipCount: number };

type Slide = { kind: "brand" } | { kind: "anime"; anime: FeaturedAnime };

/** Picks the anime to feature: must have artwork, ranked by published clip
 * count, capped at MAX_ANIME_SLIDES so the carousel always leads with the
 * strongest/most active anime. */
export function pickFeatured(anime: FeaturedAnime[]): FeaturedAnime[] {
  return anime
    .filter((a) => a.artwork)
    .sort((a, b) => b.clipCount - a.clipCount)
    .slice(0, MAX_ANIME_SLIDES);
}

export function HeroCarousel({
  anime,
  stats,
}: {
  anime: FeaturedAnime[];
  stats?: { totalClips: number; totalAnime: number; qualities: string[] } | undefined;
}) {
  const slides: Slide[] = [
    { kind: "brand" },
    ...anime.map((a) => ({ kind: "anime" as const, anime: a })),
  ];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || slides.length < 2) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reduceMotion, slides.length]);

  const slide = slides[active]!;
  const goPrev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const goNext = () => setActive((i) => (i + 1) % slides.length);
  const slideKey = slide.kind === "brand" ? "brand" : slide.anime.id;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Kuragawa Clips"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative isolate overflow-hidden border-b border-border bg-background"
    >
      {/* Full-bleed backdrop: the brand image for slide one, each anime's own
          artwork for the rest. Crossfades between slides. */}
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        {slides.map((s, i) => (
          <img
            key={s.kind === "brand" ? "brand" : s.anime.id}
            src={s.kind === "brand" ? heroPrimary : s.anime.artwork}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Ambient motion: soft rotating light rays + drifting particles.
          Purely decorative, so hidden from assistive tech, and skipped
          entirely when the visitor prefers reduced motion. */}
      {!reduceMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-rays absolute inset-0 opacity-25" />
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="hero-particle absolute block h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_var(--primary)]"
              style={{
                left: `${8 + i * 12}%`,
                animationDelay: `${i * 1.1}s`,
                animationDuration: `${8 + (i % 3) * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {slide.kind === "brand" ? (
          <div key={slideKey} className="hero-fade-in max-w-xl">
            <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
              Frames that live longer
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] font-semibold sm:text-6xl">
              Anime clips for creators
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              High-quality anime clips, organized for editors, creators and fans. Find. Download.
              Create.
            </p>
            <Link
              to="/browse"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Explore Clips →
            </Link>
            {stats ? (
              <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
                <div>
                  <dd className="font-display text-2xl font-bold tabular-nums">
                    {stats.totalClips}+
                  </dd>
                  <dt className="text-xs text-muted-foreground">Clips</dt>
                </div>
                <div>
                  <dd className="font-display text-2xl font-bold tabular-nums">
                    {stats.totalAnime}+
                  </dd>
                  <dt className="text-xs text-muted-foreground">Anime</dt>
                </div>
                {stats.qualities.length > 0 ? (
                  <div>
                    <dd className="font-display text-2xl font-bold">
                      {stats.qualities.join(" / ")}
                    </dd>
                    <dt className="text-xs text-muted-foreground">Quality</dt>
                  </div>
                ) : null}
                <div>
                  <dd className="font-display text-2xl font-bold">For</dd>
                  <dt className="text-xs text-muted-foreground">Creators</dt>
                </div>
              </dl>
            ) : null}
          </div>
        ) : (
          <div key={slideKey} className="hero-fade-in max-w-xl">
            <p className="eyebrow">Featured anime</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02] font-bold tracking-tight uppercase sm:text-5xl">
              {slide.anime.name}
            </h2>
            {slide.anime.description ? (
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                {slide.anime.description}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                to="/anime/$slug"
                params={{ slug: slide.anime.slug }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Browse Clips →
              </Link>
              <span className="text-xs text-muted-foreground">
                {slide.anime.clipCount} {slide.anime.clipCount === 1 ? "clip" : "clips"}
              </span>
            </div>
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute top-1/2 left-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-background/60 text-foreground backdrop-blur transition-colors hover:bg-background/90 sm:left-5"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute top-1/2 right-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-background/60 text-foreground backdrop-blur transition-colors hover:bg-background/90 sm:right-5"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
