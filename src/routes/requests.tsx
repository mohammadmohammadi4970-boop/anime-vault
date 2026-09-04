import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageShell } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Request a clip — Kuragawa Clips" },
      {
        name: "description",
        content: "Tell us which anime or moment you want added to Kuragawa Clips.",
      },
      { property: "og:title", content: "Request a clip — Kuragawa Clips" },
      { property: "og:description", content: "Tell us what you want added." },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const [animeName, setAnimeName] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");

  const submit = async () => {
    if (!animeName.trim()) return;
    setStatus("busy");
    const { error } = await supabase
      .from("requests")
      .insert({ anime_name: animeName.trim(), details: details.trim() });
    if (error) {
      setStatus("error");
      return;
    }
    setAnimeName("");
    setDetails("");
    setStatus("done");
  };

  return (
    <PageShell eyebrow="Requests" title="Request a clip">
      <p className="max-w-xl text-sm text-muted-foreground">
        Don't see an anime, character, or scene you're after? Tell us what to add next — no account
        needed.
      </p>

      {status === "done" ? (
        <div className="mt-8 max-w-xl rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm text-primary-soft">
          Thanks — your request has been sent. We'll take a look.
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="ml-2 underline underline-offset-2 hover:text-foreground"
          >
            Send another
          </button>
        </div>
      ) : (
        <form
          className="mt-8 max-w-xl space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <label htmlFor="anime-name" className="mb-1.5 block text-sm text-muted-foreground">
              Anime or character
            </label>
            <input
              id="anime-name"
              required
              value={animeName}
              onChange={(e) => setAnimeName(e.target.value)}
              placeholder="e.g. Jujutsu Kaisen — Gojo"
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label htmlFor="details" className="mb-1.5 block text-sm text-muted-foreground">
              Details (optional)
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Specific episode, scene, or moment you have in mind…"
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary/50"
            />
          </div>

          {status === "error" ? (
            <p className="text-xs text-destructive">
              Something went wrong sending that — please try again.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === "busy"}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {status === "busy" ? "Sending…" : "Send request"}
          </button>
        </form>
      )}
    </PageShell>
  );
}
