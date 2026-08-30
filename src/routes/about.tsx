import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/Section";
import { aboutContent } from "@/data/repository";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kuragawa Clips" },
      {
        name: "description",
        content:
          "Kuragawa Clips is a curated anime clip library built for editors and creators who care about quality.",
      },
      { property: "og:title", content: "About — Kuragawa Clips" },
      { property: "og:description", content: "A curated anime clip library for creators." },
    ],
  }),
  loader: async () => ({ content: await aboutContent() }),
  component: AboutPage,
});

function AboutPage() {
  const { content } = Route.useLoaderData();
  return (
    <LegalPage title={content.heading}>
      {content.imageUrl ? (
        <img
          src={content.imageUrl}
          alt={content.heading}
          loading="lazy"
          className="mb-6 w-full rounded-2xl border border-border object-cover"
        />
      ) : null}
      {content.content
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((para, i) => (
          <p key={i}>{para}</p>
        ))}
    </LegalPage>
  );
}
