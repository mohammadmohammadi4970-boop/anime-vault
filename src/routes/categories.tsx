import { Link, createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/site/Section";
import { categoriesWithCounts } from "@/data/repository";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Kuragawa Clips" },
      {
        name: "description",
        content:
          "Fights, transformations, powers, emotional beats and more. Browse the Kuragawa Clips library by category.",
      },
      { property: "og:title", content: "Categories — Kuragawa Clips" },
      { property: "og:description", content: "Browse the anime clip library by category." },
    ],
  }),
  loader: async () => ({ categories: await categoriesWithCounts() }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories } = Route.useLoaderData();

  return (
    <PageShell
      eyebrow="Collections"
      title="Categories"
      description="Categories are data records, managed from the admin dashboard rather than in code."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/browse"
            className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
          >
            <h2 className="font-display text-base font-semibold group-hover:text-primary-soft">
              {c.name}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {c.clipCount} clip{c.clipCount === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
