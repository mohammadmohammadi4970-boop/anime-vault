import { Link } from "@tanstack/react-router";

import heroPrimary from "@/assets/hero-primary.jpg";

export function PrimaryHero({
  stats,
}: {
  stats?: { totalClips: number; totalAnime: number; qualities: string[] } | undefined;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <img
        src={heroPrimary}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[75%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/75 to-background/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/40" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Frames that live longer
        </p>
        <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.05] font-semibold sm:text-6xl">
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
              <dd className="font-display text-2xl font-bold tabular-nums">{stats.totalClips}+</dd>
              <dt className="text-xs text-muted-foreground">Clips</dt>
            </div>
            <div>
              <dd className="font-display text-2xl font-bold tabular-nums">{stats.totalAnime}+</dd>
              <dt className="text-xs text-muted-foreground">Anime</dt>
            </div>
            {stats.qualities.length > 0 ? (
              <div>
                <dd className="font-display text-2xl font-bold">{stats.qualities.join(" / ")}</dd>
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
    </section>
  );
}
