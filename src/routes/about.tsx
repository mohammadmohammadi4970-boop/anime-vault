import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/Section";

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
  component: () => (
    <LegalPage title="About Kuragawa Clips">
      <p>
        Kuragawa Clips is a curated anime clip library built for editors, creators and fans. The
        standard is simple: clean sources, accurate metadata and no clutter.
      </p>
      <p>
        Every clip in the library is a data record — title, anime, character, aliases, tags,
        category, screenshots and an external download link — so the catalogue can grow to hundreds
        of clips without a single new page being written by hand.
      </p>
      <p className="text-xs">Placeholder copy — replace with your own wording.</p>
    </LegalPage>
  ),
});
