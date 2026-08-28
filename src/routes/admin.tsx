import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/Section";

const PLANNED = [
  ["Dashboard", "Library overview: total clips, drafts, recent activity."],
  ["Add New Clip", "Full metadata form + Google Drive URL + draft/published toggle."],
  ["Edit / Delete Clip", "Update or remove any existing clip record."],
  ["Publish / Unpublish", "Control which clips appear on the public site."],
  ["Manage Anime", "Create series entries, artwork, descriptions and aliases."],
  ["Manage Categories", "Create and reorder the categories shown publicly."],
  ["Manage Tags & Aliases", "Curate the vocabulary the search engine matches against."],
] as const;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Kuragawa Clips" },
      { name: "description", content: "Private admin area for managing the Kuragawa Clips library." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin — Kuragawa Clips" },
      { property: "og:description", content: "Private admin area." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <PageShell
      eyebrow="Private"
      title="Admin Dashboard"
      description="Phase 1 reserves this route and its structure. Authentication and the clip management forms arrive in Phase 2, backed by the same data layer the public site already reads from."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANNED.map(([title, detail]) => (
          <section key={title} className="rounded-2xl border border-dashed border-border bg-surface/40 p-5">
            <h2 className="font-display text-sm font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Phase 2
            </p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
