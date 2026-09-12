import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { formatDuration } from "@/data/repository";
import { supabase } from "@/integrations/supabase/client";
import type { Clip } from "@/data/types";

export function ClipCard({ clip, animeName }: { clip: Clip; animeName?: string | undefined }) {
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
          {/* Small download button — hover only on desktop, always on touch.
              Goes straight to Google Drive without opening the detail page. */}
          <a
            href={clip.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void supabase.rpc("increment_download_count", { clip_id: clip.id });
              window.open(clip.downloadUrl, "_blank", "noopener,noreferrer");
            }}
            aria-label={`Download ${clip.title}`}
            className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-all hover:text-foreground hover:bg-background/90 focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
          >
            <Download aria-hidden className="h-3.5 w-3.5" />
          </a>
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
