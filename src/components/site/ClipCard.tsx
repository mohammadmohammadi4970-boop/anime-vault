import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDuration } from "@/data/repository";
import { supabase } from "@/integrations/supabase/client";
import { youtubePreviewUrl } from "@/lib/youtube";
import type { Clip } from "@/data/types";

export function ClipCard({ clip, animeName }: { clip: Clip; animeName?: string | undefined }) {
  const [hovering, setHovering] = useState(false);
  const previewUrl = clip.youtubeUrl ? youtubePreviewUrl(clip.youtubeUrl) : null;
  const showPreview = hovering && previewUrl !== null;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-24px_var(--primary)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link to="/clips/$slug" params={{ slug: clip.slug }} className="block">
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          <img
            src={clip.thumbnail}
            alt={`Thumbnail for ${clip.title}`}
            loading="lazy"
            width={768}
            height={512}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${showPreview ? "opacity-0" : "opacity-100"}`}
          />
          {/* Only mounted while actually hovering — never loads for cards
              that aren't being looked at, so a grid of 20 cards doesn't
              try to run 20 embedded players at once. */}
          {showPreview ? (
            <iframe
              src={previewUrl}
              title={`${clip.title} preview`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media"
              tabIndex={-1}
            />
          ) : null}
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
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Download ${clip.title}`}
        title="Download clip"
        onClick={() => {
          void supabase.rpc("increment_download_count", { clip_id: clip.id });
          window.open(clip.downloadUrl, "_blank", "noopener,noreferrer");
        }}
        className="absolute left-2 top-[calc(56.25%-2.5rem)] h-8 w-8 border-none bg-primary text-primary-foreground opacity-0 shadow-[0_2px_10px_rgba(0,0,0,0.45)] hover:bg-primary/85 focus-visible:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
      >
        <Download aria-hidden className="h-3.5 w-3.5" />
      </Button>
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
