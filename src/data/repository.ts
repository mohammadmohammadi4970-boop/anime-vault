/**
 * Data access layer.
 *
 * Every page reads clips/anime/categories through these async functions.
 * They now query Lovable Cloud (Postgres) through the read-only public client,
 * so the public site only ever sees published clips.
 */
import { publicDb } from "./public-client";
import type {
  AboutContent,
  Anime,
  Category,
  Clip,
  ClipQuery,
  FooterContent,
  HomepageContent,
} from "./types";

type ClipRow = {
  id: string;
  title: string;
  slug: string;
  anime_id: string | null;
  category_id: string | null;
  character: string | null;
  character_aliases: string[];
  anime_aliases: string[];
  tags: string[];
  description: string;
  thumbnail_url: string | null;
  screenshot_urls: string[];
  duration: number;
  resolution: string;
  format: string;
  download_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type AnimeRow = {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

const FALLBACK_IMAGE = "/seed/clip-1.jpg";

/** Slug lookup maps, resolved per request (cheap: both tables are small). */
async function slugMaps() {
  const [{ data: anime }, { data: categories }] = await Promise.all([
    publicDb.from("anime").select("id, slug, name, aliases"),
    publicDb.from("categories").select("id, slug, name"),
  ]);
  return {
    animeById: new Map((anime ?? []).map((a) => [a.id, a])),
    categoryById: new Map((categories ?? []).map((c) => [c.id, c])),
  };
}

function toClip(
  row: ClipRow,
  animeById: Map<string, { slug: string; aliases: string[] }>,
  categoryById: Map<string, { slug: string }>,
): Clip {
  const anime = row.anime_id ? animeById.get(row.anime_id) : undefined;
  const category = row.category_id ? categoryById.get(row.category_id) : undefined;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    animeSlug: anime?.slug ?? "",
    character: row.character,
    aliases: [...(row.character_aliases ?? []), ...(row.anime_aliases ?? [])],
    tags: row.tags ?? [],
    categorySlug: category?.slug ?? "",
    description: row.description ?? "",
    thumbnail: row.thumbnail_url || FALLBACK_IMAGE,
    screenshots:
      row.screenshot_urls?.length > 0
        ? row.screenshot_urls
        : [row.thumbnail_url || FALLBACK_IMAGE],
    duration: row.duration ?? 0,
    resolution: row.resolution,
    format: row.format,
    downloadUrl: row.download_url ?? "",
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAnime(row: AnimeRow): Anime {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    aliases: row.aliases ?? [],
    description: row.description ?? "",
    artwork: row.image_url || FALLBACK_IMAGE,
  };
}

/** Fields the search engine matches against (mirrors the database search index). */
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
  const { data } = await publicDb.from("anime").select("*").order("name");
  return ((data ?? []) as AnimeRow[]).map(toAnime);
}

export async function getAnime(slug: string): Promise<Anime | undefined> {
  const { data } = await publicDb.from("anime").select("*").eq("slug", slug).maybeSingle();
  return data ? toAnime(data as AnimeRow) : undefined;
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await publicDb.from("categories").select("*").order("name");
  return ((data ?? []) as CategoryRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
  }));
}

async function publishedRows(): Promise<ClipRow[]> {
  const { data } = await publicDb
    .from("clips")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data ?? []) as ClipRow[];
}

export async function listCharacters(): Promise<string[]> {
  const rows = await publishedRows();
  return Array.from(new Set(rows.map((r) => r.character).filter(Boolean) as string[])).sort();
}

export async function listQualities(): Promise<string[]> {
  const rows = await publishedRows();
  return Array.from(new Set(rows.map((r) => r.resolution)));
}

export async function listClips(query: ClipQuery = {}): Promise<Clip[]> {
  const { animeById, categoryById } = await slugMaps();

  let rows: ClipRow[];
  const term = query.search?.trim();
  if (term) {
    const { data } = await publicDb.rpc("search_clips", { q: term });
    rows = ((data ?? []) as ClipRow[]).filter((r) => r.published);
  } else {
    rows = await publishedRows();
  }

  let result = rows.map((r) => toClip(r, animeById, categoryById));

  if (query.anime) result = result.filter((c) => c.animeSlug === query.anime);
  if (query.character) result = result.filter((c) => c.character === query.character);
  if (query.category) result = result.filter((c) => c.categorySlug === query.category);
  if (query.quality) result = result.filter((c) => c.resolution === query.quality);

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
  const { data } = await publicDb
    .from("clips")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!data) return undefined;
  const { animeById, categoryById } = await slugMaps();
  return toClip(data as ClipRow, animeById, categoryById);
}

export async function relatedClips(clip: Clip, limit = 4): Promise<Clip[]> {
  const all = await listClips();
  const pool = all.filter((c) => c.id !== clip.id);
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
  const [anime, clips] = await Promise.all([listAnime(), listClips()]);
  return anime.map((a) => ({
    ...a,
    clipCount: clips.filter((c) => c.animeSlug === a.slug).length,
  }));
}

export async function categoriesWithCounts(): Promise<Array<Category & { clipCount: number }>> {
  const [categories, clips] = await Promise.all([listCategories(), listClips()]);
  return categories.map((c) => ({
    ...c,
    clipCount: clips.filter((clip) => clip.categorySlug === c.slug).length,
  }));
}

/* ---------------------------------- CMS ---------------------------------- */

async function content<T>(key: string, fallback: T): Promise<T> {
  const { data } = await publicDb.from("site_content").select("value").eq("key", key).maybeSingle();
  return { ...fallback, ...((data?.value as Partial<T>) ?? {}) };
}

export async function homepageContent(): Promise<HomepageContent> {
  return content<HomepageContent>("homepage", {
    heroHeading: "KURAGAWA",
    heroHeadingAccent: "CLIPS",
    heroTagline: "Anime clips. Higher standards.",
    heroDescription:
      "High-quality anime clips for editors, creators and fans. Find, download and create something extraordinary.",
    heroImageUrl: "",
    heroNote: "New anime clips, updated as new episodes drop.",
    popularSearches: [],
  });
}

export async function aboutContent(): Promise<AboutContent> {
  return content<AboutContent>("about", {
    heading: "About Kuragawa Clips",
    content:
      "Kuragawa Clips is a curated library of high-quality anime clips for editors, creators and fans.",
    imageUrl: "",
  });
}

export async function footerContent(): Promise<FooterContent> {
  return content<FooterContent>("footer", {
    description:
      "High-quality anime clips for editors, creators and fans. Anime clips. Higher standards.",
    copyright: "Kuragawa Clips. All rights reserved.",
    socialLinks: [],
  });
}

/** Popular search chips — editable in the admin dashboard. */
export async function popularSearches(): Promise<string[]> {
  const home = await homepageContent();
  if (home.popularSearches.length > 0) return home.popularSearches;
  const clips = await listClips();
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
