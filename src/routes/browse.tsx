import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ClipGrid } from "@/components/site/ClipCard";
import { PageShell } from "@/components/site/Section";
import {
  listAnime,
  listCategories,
  listCharacters,
  listClips,
  listQualities,
} from "@/data/repository";
import type { SortOption } from "@/data/types";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Clips — Kuragawa Clips" },
      {
        name: "description",
        content:
          "Browse the full Kuragawa Clips library. Filter anime clips by anime, character, category and quality, then sort by newest, oldest or A-Z.",
      },
      { property: "og:title", content: "Browse Clips — Kuragawa Clips" },
      {
        property: "og:description",
        content: "Filter and sort the full anime clip library.",
      },
    ],
  }),
  loader: async () => ({
    clips: await listClips(),
    anime: await listAnime(),
    categories: await listCategories(),
    characters: await listCharacters(),
    qualities: await listQualities(),
  }),
  component: BrowsePage,
});

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-xs text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors hover:border-border-strong focus:border-primary/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function BrowsePage() {
  const { clips, anime, categories, characters, qualities } = Route.useLoaderData();
  const [search, setSearch] = useState("");
  const [animeSlug, setAnimeSlug] = useState("");
  const [character, setCharacter] = useState("");
  const [category, setCategory] = useState("");
  const [quality, setQuality] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  const animeNames = useMemo(
    () => Object.fromEntries(anime.map((a) => [a.slug, a.name])),
    [anime],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let out = clips.filter(
      (c) =>
        (!animeSlug || c.animeSlug === animeSlug) &&
        (!character || c.character === character) &&
        (!category || c.categorySlug === category) &&
        (!quality || c.resolution === quality) &&
        (!term ||
          [c.title, c.character ?? "", animeNames[c.animeSlug] ?? "", ...c.aliases, ...c.tags]
            .join(" ")
            .toLowerCase()
            .includes(term)),
    );
    if (sort === "az") out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "oldest")
      out = [...out].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else out = [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return out;
  }, [clips, search, animeSlug, character, category, quality, sort, animeNames]);

  return (
    <PageShell
      eyebrow="Library"
      title="Browse Clips"
      description="Every published clip in the library. Filters and sorting run against clip metadata, so they keep working as the database grows."
    >
      <div className="surface-panel rounded-2xl p-4 sm:p-5">
        <label htmlFor="browse-search" className="block text-xs text-muted-foreground">
          Search
        </label>
        <input
          id="browse-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search titles, characters, aliases, tags..."
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 placeholder:text-muted-foreground"
        />

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field
            label="Anime"
            value={animeSlug}
            onChange={setAnimeSlug}
            options={[
              { value: "", label: "All anime" },
              ...anime.map((a) => ({ value: a.slug, label: a.name })),
            ]}
          />
          <Field
            label="Character"
            value={character}
            onChange={setCharacter}
            options={[
              { value: "", label: "All characters" },
              ...characters.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Field
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: "", label: "All categories" },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <Field
            label="Quality"
            value={quality}
            onChange={setQuality}
            options={[
              { value: "", label: "Any quality" },
              ...qualities.map((q) => ({ value: q, label: q })),
            ]}
          />
          <Field
            label="Sort by"
            value={sort}
            onChange={(v) => setSort(v as SortOption)}
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "az", label: "A–Z" },
            ]}
          />
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {filtered.length} clip{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="mt-4">
        <ClipGrid clips={filtered} animeNames={animeNames} />
      </div>
    </PageShell>
  );
}
