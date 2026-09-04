import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

import { ClipGrid } from "@/components/site/ClipCard";
import { formatDuration, getAnime, getClip, listCategories, relatedClips } from "@/data/repository";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/clips/$slug")({
  loader: async ({ params }) => {
    const clip = await getClip(params.slug);
    if (!clip) throw notFound();
    const anime = await getAnime(clip.animeSlug);
    const categories = await listCategories();
    return {
      clip,
      animeName: anime?.name ?? clip.animeSlug,
      categoryName: categories.find((c) => c.slug === clip.categorySlug)?.name ?? clip.categorySlug,
      related: await relatedClips(clip),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Clip not found — Kuragawa Clips" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { clip, animeName } = loaderData;
    return {
      meta: [
        { title: `${clip.title} — Kuragawa Clips` },
        {
          name: "description",
          content: `${animeName}${clip.character ? ` • ${clip.character}` : ""} — ${clip.description}`,
        },
        { property: "og:title", content: `${clip.title} — Kuragawa Clips` },
        {
          property: "og:description",
          content: `${animeName} clip in ${clip.resolution} ${clip.format}.`,
        },
      ],
    };
  },
  component: ClipPage,
});

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-3">
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm">{value}</dd>
    </div>
  );
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2] ?? null;
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2] ?? null;
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function ClipPage() {
  const { clip, animeName, categoryName, related } = Route.useLoaderData();
  const embedUrl = clip.youtubeUrl ? youtubeEmbedUrl(clip.youtubeUrl) : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        to="/browse"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" /> Back to Browse
      </Link>

      <header className="mt-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{clip.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {animeName}
          {clip.character ? ` • ${clip.character}` : ""}
        </p>
      </header>

      {embedUrl ? (
        <section aria-label="Preview" className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-black">
            <iframe
              src={embedUrl}
              title={`${clip.title} preview`}
              className="aspect-video w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      <section
        aria-label="Screenshots"
        className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${embedUrl ? "mt-4" : "mt-8"}`}
      >
        {clip.screenshots.map((shot, i) => (
          <img
            key={shot + i}
            src={shot}
            alt={`Screenshot ${i + 1} from ${clip.title}`}
            loading={i === 0 ? "eager" : "lazy"}
            width={768}
            height={512}
            className="aspect-video w-full rounded-2xl border border-border object-cover"
          />
        ))}
      </section>

      <div className="mt-8">
        <a
          href={clip.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            void supabase.rpc("increment_download_count", { clip_id: clip.id });
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/85 hover:glow-ring sm:w-auto"
        >
          <Download aria-hidden className="h-4 w-4" /> Download Clip
        </a>
        <p className="mt-2 text-xs text-muted-foreground">
          Downloads open the external file link stored on this clip's record.
        </p>
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {clip.description}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Meta label="Anime" value={animeName} />
        <Meta label="Character" value={clip.character ?? "—"} />
        <Meta label="Category" value={categoryName} />
        {clip.season !== null && <Meta label="Season" value={String(clip.season)} />}
        {clip.episode !== null && <Meta label="Episode" value={String(clip.episode)} />}
        <Meta label="Duration" value={formatDuration(clip.duration)} />
        <Meta label="Quality" value={clip.resolution} />
        <Meta label="Format" value={clip.format} />
      </dl>

      <section className="mt-10" aria-label="Tags">
        <h2 className="eyebrow">Tags</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {clip.tags.map((tag) => (
            <Link
              key={tag}
              to="/search"
              search={{ q: tag }}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-14" aria-label="Related clips">
          <h2 className="font-display text-xl font-bold">You May Also Like</h2>
          <div className="mt-6">
            <ClipGrid clips={related} />
          </div>
        </section>
      )}
    </main>
  );
}
