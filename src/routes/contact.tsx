import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/site/Section";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Kuragawa Clips" },
      {
        name: "description",
        content: "Get in touch with Kuragawa Clips about clip requests, takedowns or collaborations.",
      },
      { property: "og:title", content: "Contact — Kuragawa Clips" },
      { property: "og:description", content: "Reach the Kuragawa Clips team." },
    ],
  }),
  component: () => (
    <LegalPage title="Contact">
      <p>
        For clip requests, takedown notices or collaborations, reach out at the address below.
      </p>
      <p className="text-foreground">hello@kuragawaclips.example</p>
      <p className="text-xs">Placeholder copy — replace with your real contact details.</p>
    </LegalPage>
  ),
});
