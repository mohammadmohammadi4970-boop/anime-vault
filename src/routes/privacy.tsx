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
      <p>
        Visit statistics: we count page views to understand which clips and pages are popular. For
        each visit we store only the page address, the country the visit came from, whether the
        device is a phone, tablet or computer, and which kind of site referred you. We also store a
        short code that changes every day so repeat pages in one visit are not counted twice. We do
        not store your name, email or IP address, we do not use tracking cookies, and we do not share
        this information with advertisers.
      </p>
      <p>Sections to cover: data collected, cookies, analytics, third-party links, contact.</p>
    </LegalPage>
  ),
});
