/**
 * SAMPLE DATA ONLY — demonstrates the UI during Phase 1.
 * This module is replaced by database reads in Phase 2; nothing outside
 * `src/data/repository.ts` should import it.
 */
import clip1 from "@/assets/clip-1.jpg";
import clip2 from "@/assets/clip-2.jpg";
import clip3 from "@/assets/clip-3.jpg";
import clip4 from "@/assets/clip-4.jpg";
import clip5 from "@/assets/clip-5.jpg";
import clip6 from "@/assets/clip-6.jpg";

import type { Anime, Category, Clip } from "./types";

const art = [clip1, clip2, clip3, clip4, clip5, clip6];
const pick = (i: number): string => art[((i % art.length) + art.length) % art.length] as string;

export const sampleCategories: Category[] = [
  { id: "c1", name: "Fights", slug: "fights", description: "Combat exchanges and duels." },
  {
    id: "c2",
    name: "Transformations",
    slug: "transformations",
    description: "Power-ups, awakenings and form changes.",
  },
  { id: "c3", name: "Powers", slug: "powers", description: "Ability showcases and techniques." },
  { id: "c4", name: "Emotional", slug: "emotional", description: "Quiet, heavy character beats." },
  { id: "c5", name: "Characters", slug: "characters", description: "Character-focused moments." },
  { id: "c6", name: "Scenes", slug: "scenes", description: "Complete standout scenes." },
  { id: "c7", name: "Aesthetic", slug: "aesthetic", description: "Atmosphere, colour and scenery." },
  { id: "c8", name: "Action", slug: "action", description: "High-motion sequences." },
];

export const sampleAnime: Anime[] = [
  {
    id: "a1",
    name: "Sample Series Alpha",
    slug: "sample-series-alpha",
    aliases: ["SSA"],
    description: "Placeholder series entry used to demonstrate the anime directory layout.",
    artwork: pick(2),
  },
  {
    id: "a2",
    name: "Sample Series Beta",
    slug: "sample-series-beta",
    aliases: ["SSB"],
    description: "Placeholder series entry used to demonstrate the anime directory layout.",
    artwork: pick(4),
  },
  {
    id: "a3",
    name: "Sample Series Gamma",
    slug: "sample-series-gamma",
    aliases: ["SSG"],
    description: "Placeholder series entry used to demonstrate the anime directory layout.",
    artwork: pick(5),
  },
];

const base = {
  format: "MP4",
  downloadUrl: "https://drive.google.com/file/d/SAMPLE_PLACEHOLDER/view",
  published: true,
  description:
    "Sample clip record. Metadata, screenshots and the download link all come from the clip's data record — nothing on this page is hardcoded.",
};

function makeClip(
  i: number,
  title: string,
  animeSlug: string,
  character: string,
  aliases: string[],
  categorySlug: string,
  tags: string[],
  duration: number,
  resolution: Clip["resolution"],
): Clip {
  const thumb = pick(i);
  const day = String(28 - i).padStart(2, "0");
  return {
    ...base,
    id: `clip-${i + 1}`,
    title,
    slug: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    animeSlug,
    character,
    aliases,
    tags,
    categorySlug,
    thumbnail: thumb,
    screenshots: [thumb, pick(i + 1), pick(i + 2)],
    duration,
    resolution,
    createdAt: `2026-08-${day}T12:00:00.000Z`,
    updatedAt: `2026-08-${day}T12:00:00.000Z`,
  };
}

export const sampleClips: Clip[] = [
  makeClip(0, "Sample Clip — Awakening", "sample-series-alpha", "Character One", ["Alias One"], "transformations", ["Transformation", "Glow", "Sample"], 24, "1080p"),
  makeClip(1, "Sample Clip — Ember Duel", "sample-series-alpha", "Character Two", ["Alias Two"], "fights", ["Fight", "Fire", "Sample"], 19, "1080p"),
  makeClip(2, "Sample Clip — Rain Rooftops", "sample-series-beta", "Character Three", [], "aesthetic", ["Scenery", "Night", "Sample"], 32, "4K"),
  makeClip(3, "Sample Clip — Quiet Dusk", "sample-series-beta", "Character Four", ["Alias Four"], "emotional", ["Emotional", "Sky", "Sample"], 28, "1080p"),
  makeClip(4, "Sample Clip — Violet Surge", "sample-series-gamma", "Character Five", [], "powers", ["Power", "Lightning", "Sample"], 15, "1080p"),
  makeClip(5, "Sample Clip — Spirit Forest", "sample-series-gamma", "Character Six", [], "scenes", ["Scene", "Forest", "Sample"], 27, "720p"),
  makeClip(6, "Sample Clip — Second Wind", "sample-series-alpha", "Character One", ["Alias One"], "action", ["Action", "Chase", "Sample"], 21, "4K"),
  makeClip(7, "Sample Clip — Final Stand", "sample-series-beta", "Character Three", [], "fights", ["Fight", "Finale", "Sample"], 18, "1080p"),
  makeClip(8, "Sample Clip — Hollow Echo", "sample-series-gamma", "Character Five", [], "characters", ["Character", "Portrait", "Sample"], 26, "Raw"),
  makeClip(9, "Sample Clip — Broken Sky", "sample-series-alpha", "Character Two", ["Alias Two"], "scenes", ["Scene", "Sky", "Sample"], 20, "1080p"),
];
