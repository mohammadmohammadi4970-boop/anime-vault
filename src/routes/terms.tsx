import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/Section";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Kuragawa Clips" },
      { name: "description", content: "Terms governing use of the Kuragawa Clips library." },
      { property: "og:title", content: "Terms of Service — Kuragawa Clips" },
      { property: "og:description", content: "Terms governing use of the Kuragawa Clips library." },
    ],
  }),
  component: () => (
    <LegalPage title="Terms of Service">
      <p>
        This placeholder sets out the terms governing use of Kuragawa Clips. Replace it with your
        finalised terms.
      </p>
      <p>Sections to cover: acceptable use, content ownership, downloads, liability, changes.</p>
    </LegalPage>
  ),
});
