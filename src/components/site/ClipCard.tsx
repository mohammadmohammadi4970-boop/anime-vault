import { Link } from "@tanstack/react-router";

import { formatDuration } from "@/data/repository";
import type { Clip } from "@/data/types";

export function ClipCard({ clip, animeName }: { clip: Clip; animeName?: string }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-24px_var(--primary)]">
      <Link to="/clips/$slug" params={{ slug: clip.slug }} className="block">
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          <img
            src={clip.thumbnail}
            alt={`Thumbnail for ${clip.title}`}
            loading="lazy"
            width={768}
            height={512}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute right-2 top-2 rounded-md bg-background/85 px-1.5 py-0.5 font-display text-[11px] font-medium tabular-nums backdrop-blur">
            {formatDuration(clip.duration)}
          </span>
        </div>

        <div className="p-3.5">
          <h3 className="truncate font-display text-sm font-semibold transition-colors group-hover:text-primary-soft">
            {clip.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {animeName ?? clip.animeSlug}
            {clip.character ? ` • ${clip.character}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground">
              {clip.resolution}
            </span>
            <span className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground">
              {clip.format}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ClipGrid({
  clips,
  animeNames,
}: {
  clips: Clip[];
  animeNames?: Record<string, string>;
}) {
  if (clips.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center text-sm text-muted-foreground">
        No clips match these filters yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} animeName={animeNames?.[clip.animeSlug]} />
      ))}
    </div>
  );
}
