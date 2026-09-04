import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import type { Anime } from "@/data/types";

const AUTO_ADVANCE_MS = 6000;
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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured anime"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative isolate overflow-hidden"
    >
      {/* Ambient background: soft light rays + drifting particles. Purely
          decorative, so hidden from assistive tech, and skipped entirely
          when the visitor prefers reduced motion. */}
      {!reduceMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-rays absolute inset-0 opacity-[0.15]" />
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="hero-particle absolute block h-1 w-1 rounded-full bg-primary/70"
              style={{
                left: `${12 + i * 18}%`,
                animationDelay: `${i * 1.6}s`,
                animationDuration: `${9 + i * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-20 lg:px-8">
        {/* Text side */}
        <div key={slide.id} className="hero-fade-in">
          <p className="eyebrow">Anime clips. Higher standards.</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
            {slide.name}
          </h1>
          {slide.description ? (
            <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              {slide.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-4">
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

        {/* Artwork side */}
        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-[80px]"
          />
          <img
            key={slide.id}
            src={slide.artwork}
            alt={slide.name}
            className="hero-fade-in max-h-[420px] w-auto rounded-3xl object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] sm:max-h-[480px]"
          />
        </div>
      </div>

      {anime.length > 1 && (
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-8 sm:px-6 lg:px-8">
          {anime.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${a.name}`}
              aria-current={i === active}
              className={`rounded-full px-2.5 py-1 font-display text-xs tabular-nums transition-colors ${
                i === active
                  ? "bg-primary/20 text-primary-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
