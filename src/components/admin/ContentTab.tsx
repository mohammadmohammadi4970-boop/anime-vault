import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Btn, Field, ImageField, TextArea, TextInput, csv, parseCsv } from "./shared";
import { supabase } from "@/integrations/supabase/client";
import type { AboutContent, FooterContent, HomepageContent } from "@/data/types";

type Blocks = {
  homepage: HomepageContent;
  about: AboutContent;
  footer: FooterContent;
};

const defaults: Blocks = {
  homepage: {
    heroHeading: "KURAGAWA",
    heroHeadingAccent: "CLIPS",
    heroTagline: "Anime clips. Higher standards.",
    heroDescription: "",
    heroImageUrl: "",
    heroNote: "New anime clips, updated as new episodes drop.",
    popularSearches: [],
  },
  about: { heading: "", content: "", imageUrl: "" },
  footer: { description: "", copyright: "", socialLinks: [] },
};

export function ContentTab({ notify }: { notify: (msg: string, kind?: "ok" | "error") => void }) {
  const qc = useQueryClient();

  const stored = useQuery({
    queryKey: ["admin", "site_content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) throw error;
      const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<
        string,
        unknown
      >;
      return {
        homepage: { ...defaults.homepage, ...((map["homepage"] as object) ?? {}) },
        about: { ...defaults.about, ...((map["about"] as object) ?? {}) },
        footer: { ...defaults.footer, ...((map["footer"] as object) ?? {}) },
      } as Blocks;
    },
  });

  const [blocks, setBlocks] = useState<Blocks | null>(null);
  useEffect(() => {
    if (stored.data) setBlocks(stored.data);
  }, [stored.data]);

  const save = useMutation({
    mutationFn: async (next: Blocks) => {
      const { error } = await supabase.from("site_content").upsert(
        [
          { key: "homepage", value: next.homepage },
          { key: "about", value: next.about },
          { key: "footer", value: next.footer },
        ],
        { onConflict: "key" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      notify("Website content saved — refresh the public site to see it");
      void qc.invalidateQueries({ queryKey: ["admin", "site_content"] });
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  if (!blocks) return <p className="text-sm text-muted-foreground">Loading content…</p>;

  const home = blocks.homepage;
  const about = blocks.about;
  const footer = blocks.footer;
  const setHome = (patch: Partial<HomepageContent>) =>
    setBlocks({ ...blocks, homepage: { ...home, ...patch } });
  const setAbout = (patch: Partial<AboutContent>) =>
    setBlocks({ ...blocks, about: { ...about, ...patch } });
  const setFooter = (patch: Partial<FooterContent>) =>
    setBlocks({ ...blocks, footer: { ...footer, ...patch } });

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold">Homepage</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Hero heading">
            <TextInput
              value={home.heroHeading}
              onChange={(e) => setHome({ heroHeading: e.target.value })}
            />
          </Field>
          <Field label="Hero heading accent">
            <TextInput
              value={home.heroHeadingAccent}
              onChange={(e) => setHome({ heroHeadingAccent: e.target.value })}
            />
          </Field>
          <Field label="Hero tagline">
            <TextInput
              value={home.heroTagline}
              onChange={(e) => setHome({ heroTagline: e.target.value })}
            />
          </Field>
          <Field label="Hero note (under the hero)">
            <TextInput
              value={home.heroNote}
              onChange={(e) => setHome({ heroNote: e.target.value })}
            />
          </Field>
          <Field label="Popular search terms (comma separated)">
            <TextInput
              value={csv(home.popularSearches)}
              onChange={(e) => setHome({ popularSearches: parseCsv(e.target.value) })}
            />
          </Field>
          <ImageField
            label="Hero image"
            folder="site"
            value={home.heroImageUrl}
            onChange={(url) => setHome({ heroImageUrl: url })}
          />
        </div>
        <div className="mt-4">
          <Field label="Hero description">
            <TextArea
              value={home.heroDescription}
              onChange={(e) => setHome({ heroDescription: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="surface-panel rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold">About page</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Heading">
            <TextInput
              value={about.heading}
              onChange={(e) => setAbout({ heading: e.target.value })}
            />
          </Field>
          <ImageField
            label="About image"
            folder="site"
            value={about.imageUrl}
            onChange={(url) => setAbout({ imageUrl: url })}
          />
        </div>
        <div className="mt-4">
          <Field label="Content (blank line separates paragraphs)">
            <textarea
              rows={8}
              value={about.content}
              onChange={(e) => setAbout({ content: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
            />
          </Field>
        </div>
      </section>

      <section className="surface-panel rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold">Footer</h3>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="Description">
            <TextArea
              value={footer.description}
              onChange={(e) => setFooter({ description: e.target.value })}
            />
          </Field>
          <Field label="Copyright text">
            <TextInput
              value={footer.copyright}
              onChange={(e) => setFooter({ copyright: e.target.value })}
            />
          </Field>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">Social links</p>
        <div className="mt-2 space-y-2">
          {footer.socialLinks.map((link, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <Field label="Label">
                <TextInput
                  value={link.label}
                  onChange={(e) => {
                    const next = [...footer.socialLinks];
                    next[i] = { ...link, label: e.target.value };
                    setFooter({ socialLinks: next });
                  }}
                />
              </Field>
              <Field label="URL">
                <TextInput
                  value={link.url}
                  onChange={(e) => {
                    const next = [...footer.socialLinks];
                    next[i] = { ...link, url: e.target.value };
                    setFooter({ socialLinks: next });
                  }}
                />
              </Field>
              <Btn
                variant="danger"
                onClick={() =>
                  setFooter({ socialLinks: footer.socialLinks.filter((_, idx) => idx !== i) })
                }
              >
                Remove
              </Btn>
            </div>
          ))}
          <Btn
            variant="ghost"
            onClick={() => setFooter({ socialLinks: [...footer.socialLinks, { label: "", url: "" }] })}
          >
            Add social link
          </Btn>
        </div>
      </section>

      <Btn disabled={save.isPending} onClick={() => save.mutate(blocks)}>
        {save.isPending ? "Saving…" : "Save website content"}
      </Btn>
    </div>
  );
}
