import { Link, createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/Section";
import { animeWithCounts } from "@/data/repository";

export const Route = createFileRoute("/anime/")({
  head: () => ({
    meta: [
      { title: "Anime Directory — Kuragawa Clips" },
      {
        name: "description",
        content:
          "Every anime series represented in the Kuragawa Clips library, with clip counts and dedicated series pages.",
      },
      { property: "og:title", content: "Anime Directory — Kuragawa Clips" },
      {
        property: "og:description",
        content: "Browse anime series represented in the clip library.",
      },
    ],
  }),
  loader: async () => ({ anime: await animeWithCounts() }),
  component: AnimeDirectory,
});

function AnimeDirectory() {
  const { anime } = Route.useLoaderData();

  return (
    <PageShell
      eyebrow="Directory"
      title="Anime"
      description="Series pages are generated from the database — adding a clip for a new series adds it here automatically."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {anime.map((a) => (
          <Link
            key={a.id}
            to="/anime/$slug"
            params={{ slug: a.slug }}
            className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
          >
            <div className="aspect-[3/2] overflow-hidden bg-surface-2">
              <img
                src={a.artwork}
                alt={`${a.name} artwork`}
                loading="lazy"
                width={768}
                height={512}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h2 className="truncate font-display text-sm font-semibold group-hover:text-primary-soft">
                {a.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.clipCount} clip{a.clipCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
