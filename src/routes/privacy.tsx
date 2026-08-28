import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/Section";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Kuragawa Clips" },
      { name: "description", content: "How Kuragawa Clips handles visitor data." },
      { property: "og:title", content: "Privacy Policy — Kuragawa Clips" },
      { property: "og:description", content: "How Kuragawa Clips handles visitor data." },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <p>
        This placeholder describes how Kuragawa Clips collects, uses and stores visitor
        information. Replace it with your finalised policy.
      </p>
      <p>Sections to cover: data collected, cookies, analytics, third-party links, contact.</p>
    </LegalPage>
  ),
});
