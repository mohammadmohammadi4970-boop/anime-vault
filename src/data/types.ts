/**
 * Domain model for Kuragawa Clips.
 *
 * These types mirror the future database tables (clips, anime, categories).
 * The public site reads through `src/data/repository.ts` only, so swapping the
 * in-memory sample source for Lovable Cloud requires no component changes.
 */

export type ClipQuality = "1080p" | "4K" | "720p" | "Raw";

export interface Clip {
  id: string;
  title: string;
  slug: string;
  animeSlug: string;
  character: string | null;
  aliases: string[];
  tags: string[];
  categorySlug: string;
  description: string;
  thumbnail: string;
  screenshots: string[];
  /** seconds */
  duration: number;
  resolution: ClipQuality;
  format: string;
  /** External (e.g. Google Drive) URL. Never hardcoded in the UI. */
  downloadUrl: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Anime {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  description: string;
  artwork: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export type SortOption = "newest" | "oldest" | "az";

export interface ClipQuery {
  search?: string;
  anime?: string;
  character?: string;
  category?: string;
  quality?: string;
  sort?: SortOption;
  limit?: number;
}
