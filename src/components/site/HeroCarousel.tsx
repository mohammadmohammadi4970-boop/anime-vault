import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Anime } from "@/data/types";

const AUTO_ADVANCE_MS = 5000;
const MAX_SLIDES = 6;

export type FeaturedAnime = Anime & { clipCount: number };

/** Picks the anime to feature: must have artwork, ranked by published clip
 * count, capped at MAX_SLIDES so the carousel always leads with the
 * strongest/most active anime. */
export function pickFeatured(anime: FeaturedAnime[]): FeaturedAnime[] {
  return anime
    .filter((a) => a.artwork)
    .sort((a, b) => b.clipCount - a.clipCount)
    .slice(0, MAX_SLIDES);
}

export function HeroCarousel({ anime }: { anime: FeaturedAnime[] }) {
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
    if (paused || reduceMotion || anime.length < 2) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % anime.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reduceMotion, anime.length]);

  if (anime.length === 0) return null;

  const slide = anime[active]!;
  const goPrev = () => setActive((i) => (i - 1 + anime.length) % anime.length);
  const goNext = () => setActive((i) => (i + 1) % anime.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured anime"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative isolate overflow-hidden border-b border-border bg-background"
    >
      {/* Full-bleed backdrop: each anime's own artwork fills the section,
          darkened for text legibility. Crossfades between slides. */}
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        {anime.map((a, i) => (
          <img
            key={a.id}
            src={a.artwork}
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
        <div key={slide.id} className="hero-fade-in max-w-xl">
          <p className="eyebrow">Featured anime</p>
          <h2 className="mt-3 font-display text-4xl leading-[1.02] font-bold tracking-tight uppercase sm:text-5xl">
            {slide.name}
          </h2>
          {slide.description ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {slide.description}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              to="/anime/$slug"
              params={{ slug: slide.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Browse Clips →
            </Link>
            <span className="text-xs text-muted-foreground">
              {slide.clipCount} {slide.clipCount === 1 ? "clip" : "clips"}
            </span>
          </div>
        </div>
      </div>

      {anime.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous anime"
            className="absolute top-1/2 left-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-background/60 text-foreground backdrop-blur transition-colors hover:bg-background/90 sm:left-5"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next anime"
            className="absolute top-1/2 right-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-background/60 text-foreground backdrop-blur transition-colors hover:bg-background/90 sm:right-5"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}
