import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ClipGrid } from "@/components/site/ClipCard";
import { PageShell } from "@/components/site/Section";
import { getAnime, groupByEpisode, listClips } from "@/data/repository";

export const Route = createFileRoute("/anime/$slug")({
  loader: async ({ params }) => {
    const anime = await getAnime(params.slug);
    if (!anime) throw notFound();
    return { anime, clips: await listClips({ anime: anime.slug }) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Anime not found — Kuragawa Clips" }, { name: "robots", content: "noindex" }] };
    }
    const { anime, clips } = loaderData;
    return {
      meta: [
        { title: `${anime.name} Clips — Kuragawa Clips` },
        { name: "description", content: `${clips.length} clips from ${anime.name}. ${anime.description}` },
        { property: "og:title", content: `${anime.name} Clips — Kuragawa Clips` },
        { property: "og:description", content: `${clips.length} clips from ${anime.name}.` },
      ],
    };
  },
  component: AnimePage,
});

function AnimePage() {
  const { anime, clips } = Route.useLoaderData();
  const [character, setCharacter] = useState("");

  const characters = useMemo(
    () => Array.from(new Set(clips.map((c) => c.character).filter(Boolean) as string[])).sort(),
    [clips],
  );
  const visible = character ? clips.filter((c) => c.character === character) : clips;
  const episodeGroups = useMemo(() => groupByEpisode(visible), [visible]);
  const hasEpisodeData = episodeGroups.some((g) => g.episode !== null);

  return (
    <PageShell
      eyebrow="Anime"
      title={anime.name}
      description={anime.description}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
          {clips.length} clip{clips.length === 1 ? "" : "s"}
        </span>
        <button
          type="button"
          onClick={() => setCharacter("")}
          aria-pressed={character === ""}
          className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
            character === ""
              ? "border-primary/50 bg-primary/15 text-foreground"
              : "border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          All characters
        </button>
        {characters.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCharacter(c)}
            aria-pressed={character === c}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              character === c
                ? "border-primary/50 bg-primary/15 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {hasEpisodeData ? (
          episodeGroups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="font-display text-sm font-semibold text-muted-foreground">
                {group.label}
              </h2>
              <div className="mt-3">
                <ClipGrid clips={group.clips} animeNames={{ [anime.slug]: anime.name }} />
              </div>
            </section>
          ))
        ) : (
          <ClipGrid clips={visible} animeNames={{ [anime.slug]: anime.name }} />
        )}
      </div>
    </PageShell>
  );
}
