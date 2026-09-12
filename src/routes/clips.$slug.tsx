import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Link2, Check } from "lucide-react";
import { useState } from "react";

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

function ShareRow({ clipTitle }: { clipTitle: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(clipTitle)}`;

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        {copied ? (
          <>
            <Check aria-hidden className="h-3.5 w-3.5" /> Copied!
          </>
        ) : (
          <>
            <Link2 aria-hidden className="h-3.5 w-3.5" /> Copy link
          </>
        )}
      </button>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <svg aria-hidden className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.6844-.2762-5.4874 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.2266-1.9947a.076.076 0 00-.0416-.1057c-.6526-.2476-1.2743-.5522-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1201.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.6986.7719 1.3627 1.2256 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.4943-5.1746-.8242-9.6733-3.4894-13.6603a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0949 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0949 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
        Discord
      </button>
    </div>
  );
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
        <ShareRow clipTitle={clip.title} />
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
