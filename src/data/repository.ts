/**
 * Data access layer.
 *
 * Every page reads clips/anime/categories through these async functions.
 * Phase 2 swaps the sample source for Lovable Cloud queries without touching
 * a single component.
 */
import { sampleAnime, sampleCategories, sampleClips } from "./sample";
import type { Anime, Category, Clip, ClipQuery } from "./types";

function published(clips: Clip[]) {
  return clips.filter((c) => c.published);
}

/** Fields the search engine matches against (mirrors the future search index). */
export function searchHaystack(clip: Clip, anime?: Anime): string {
  return [
    clip.title,
    clip.character ?? "",
    clip.categorySlug,
    anime?.name ?? clip.animeSlug,
    ...(anime?.aliases ?? []),
    ...clip.aliases,
    ...clip.tags,
  ]
    .join(" ")
    .toLowerCase();
}

export async function listAnime(): Promise<Anime[]> {
  return sampleAnime;
}

export async function getAnime(slug: string): Promise<Anime | undefined> {
  return sampleAnime.find((a) => a.slug === slug);
}

export async function listCategories(): Promise<Category[]> {
  return sampleCategories;
}

export async function listCharacters(): Promise<string[]> {
  return Array.from(
    new Set(published(sampleClips).map((c) => c.character).filter(Boolean) as string[]),
  ).sort();
}

export async function listQualities(): Promise<string[]> {
  return Array.from(new Set(published(sampleClips).map((c) => c.resolution)));
}

export async function listClips(query: ClipQuery = {}): Promise<Clip[]> {
  const animeBySlug = new Map(sampleAnime.map((a) => [a.slug, a]));
  let result = published(sampleClips);

  if (query.anime) result = result.filter((c) => c.animeSlug === query.anime);
  if (query.character) result = result.filter((c) => c.character === query.character);
  if (query.category) result = result.filter((c) => c.categorySlug === query.category);
  if (query.quality) result = result.filter((c) => c.resolution === query.quality);

  const term = query.search?.trim().toLowerCase();
  if (term) {
    const words = term.split(/\s+/);
    result = result.filter((c) => {
      const hay = searchHaystack(c, animeBySlug.get(c.animeSlug));
      return words.every((w) => hay.includes(w));
    });
  }

  switch (query.sort ?? "newest") {
    case "oldest":
      result = [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case "az":
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return query.limit ? result.slice(0, query.limit) : result;
}

export async function getClip(slug: string): Promise<Clip | undefined> {
  return published(sampleClips).find((c) => c.slug === slug);
}

export async function relatedClips(clip: Clip, limit = 4): Promise<Clip[]> {
  const pool = published(sampleClips).filter((c) => c.id !== clip.id);
  const scored = pool
    .map((c) => ({
      clip: c,
      score:
        (c.animeSlug === clip.animeSlug ? 2 : 0) +
        (c.categorySlug === clip.categorySlug ? 1 : 0) +
        c.tags.filter((t) => clip.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.clip);
}

export async function animeWithCounts(): Promise<Array<Anime & { clipCount: number }>> {
  const clips = published(sampleClips);
  return sampleAnime.map((a) => ({
    ...a,
    clipCount: clips.filter((c) => c.animeSlug === a.slug).length,
  }));
}

export async function categoriesWithCounts(): Promise<Array<Category & { clipCount: number }>> {
  const clips = published(sampleClips);
  return sampleCategories.map((c) => ({
    ...c,
    clipCount: clips.filter((clip) => clip.categorySlug === c.slug).length,
  }));
}

/** Popular search chips — configurable in the admin dashboard in Phase 2. */
export async function popularSearches(): Promise<string[]> {
  const clips = published(sampleClips);
  const counts = new Map<string, number>();
  for (const c of clips) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
