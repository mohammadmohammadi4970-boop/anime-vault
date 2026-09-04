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

export function HeroCarousel({
  anime,
  tagline,
  stats,
}: {
  anime: FeaturedAnime[];
  tagline: string;
  stats?: { totalClips: number; totalAnime: number; qualities: string[] } | undefined;
}) {
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
      className="relative isolate overflow-hidden border-b border-border bg-background"
    >
      {/* Atmospheric backdrop: the current slide's own artwork, blown up,
          blurred and darkened — gives each anime its own ambient mood
          without needing a separate uploaded background image. Crossfades
          between slides. */}
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        {anime.map((a, i) => (
          <img
            key={a.id}
            src={a.artwork}
            alt=""
            className={`absolute inset-0 h-full w-full scale-125 object-cover blur-3xl transition-opacity duration-1000 ${
              i === active ? "opacity-45" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/70" />
      </div>

      {/* Ambient motion: soft rotating light rays + drifting particles.
          Purely decorative, so hidden from assistive tech, and skipped
          entirely when the visitor prefers reduced motion. */}
      {!reduceMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-rays absolute inset-0 opacity-30" />
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

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-20 lg:px-8">
        {/* Text side */}
        <div key={slide.id} className="hero-fade-in">
          <p className="eyebrow flex items-center gap-2">
            <span aria-hidden className="h-px w-6 bg-primary" />
            {tagline}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.02] font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl">
            {slide.name}
          </h1>
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
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
            >
              Explore All Clips
            </Link>
          </div>

          {stats ? (
            <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6">
              <div>
                <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  Clips
                </dt>
                <dd className="font-display text-lg font-bold tabular-nums">{stats.totalClips}+</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  Anime
                </dt>
                <dd className="font-display text-lg font-bold tabular-nums">{stats.totalAnime}+</dd>
              </div>
              {stats.qualities.length > 0 ? (
                <div>
                  <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Quality
                  </dt>
                  <dd className="font-display text-lg font-bold">{stats.qualities.join(" / ")}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  For
                </dt>
                <dd className="font-display text-lg font-bold">Creators</dd>
              </div>
            </dl>
          ) : null}
        </div>

        {/* Artwork side */}
        <div className="relative flex justify-center lg:justify-end">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-[90px]"
          />
          <img
            key={slide.id}
            src={slide.artwork}
            alt={slide.name}
            className="hero-fade-in max-h-[420px] w-auto rounded-3xl object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)] sm:max-h-[480px]"
          />
        </div>
      </div>

      {anime.length > 1 && (
        <div className="relative mx-auto flex max-w-7xl items-center gap-2 px-4 pb-8 sm:px-6 lg:px-8">
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
