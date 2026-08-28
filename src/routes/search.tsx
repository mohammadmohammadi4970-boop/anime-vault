import { createFileRoute } from "@tanstack/react-router";

import { ClipGrid } from "@/components/site/ClipCard";
import { SearchBar } from "@/components/site/SearchBar";
import { PageShell } from "@/components/site/Section";
import { listAnime, listClips, popularSearches } from "@/data/repository";

type SearchParams = { q: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  head: () => ({
    meta: [
      { title: "Search Clips — Kuragawa Clips" },
      {
        name: "description",
        content:
          "Search the Kuragawa Clips library by title, anime, character, alias, tag or category.",
      },
      { property: "og:title", content: "Search Clips — Kuragawa Clips" },
      {
        property: "og:description",
        content: "Search anime clips by title, anime, character, alias, tag or category.",
      },
    ],
  }),
  loader: async ({ deps }) => ({
    q: deps.q,
    clips: deps.q.trim() ? await listClips({ search: deps.q }) : [],
    anime: await listAnime(),
    chips: await popularSearches(),
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, clips, anime, chips } = Route.useLoaderData();
  const animeNames = Object.fromEntries(anime.map((a) => [a.slug, a.name]));

  return (
    <PageShell
      eyebrow="Search"
      title={q ? `Results for “${q}”` : "Search"}
      description="Matches title, anime, character, character aliases, anime aliases, tags and category."
    >
      <div className="max-w-3xl">
        <SearchBar initial={q} chips={chips} />
      </div>

      <div className="mt-10">
        {q.trim() ? (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              {clips.length} result{clips.length === 1 ? "" : "s"}
            </p>
            <ClipGrid clips={clips} animeNames={animeNames} />
          </>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-surface/40 p-10 text-center text-sm text-muted-foreground">
            Start typing to search the library.
          </p>
        )}
      </div>
    </PageShell>
  );
}
