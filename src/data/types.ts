/**
 * Domain model for Kuragawa Clips.
 *
 * These types mirror the database tables (clips, anime, categories).
 * The public site reads through `src/data/repository.ts` only.
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
  season: number | null;
  episode: number | null;
  description: string;
  thumbnail: string;
  screenshots: string[];
  /** seconds */
  duration: number;
  resolution: string;
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

export interface HomepageContent {
  heroHeading: string;
  heroHeadingAccent: string;
  heroTagline: string;
  heroDescription: string;
  heroImageUrl: string;
  heroNote: string;
  popularSearches: string[];
  logoUrl: string;
}

export interface AboutContent {
  heading: string;
  content: string;
  imageUrl: string;
}

export interface FooterContent {
  description: string;
  copyright: string;
  socialLinks: Array<{ label: string; url: string }>;
}
