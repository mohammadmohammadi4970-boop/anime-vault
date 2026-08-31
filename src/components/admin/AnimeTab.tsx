import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Btn, Field, ImageField, TextArea, TextInput, csv, parseCsv, slugify } from "./shared";
import { supabase } from "@/integrations/supabase/client";

type AnimeRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  aliases: string[];
  image_url: string | null;
};

const empty = (): AnimeRow => ({
  id: "",
  name: "",
  slug: "",
  description: "",
  aliases: [],
  image_url: "",
});

export function AnimeTab({ notify }: { notify: (msg: string, kind?: "ok" | "error") => void }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<AnimeRow | null>(null);
  const [q, setQ] = useState("");

  const list = useQuery({
    queryKey: ["admin", "anime-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("anime").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as AnimeRow[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const save = useMutation({
    mutationFn: async (row: AnimeRow) => {
      if (!row.name.trim()) throw new Error("Name is required");
      const { id, ...rest } = row;
      const payload = {
        ...rest,
        slug: rest.slug || slugify(rest.name),
        image_url: rest.image_url || null,
      };
      const res = id
        ? await supabase.from("anime").update(payload).eq("id", id)
        : await supabase.from("anime").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      setDraft(null);
      notify("Anime saved");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("anime").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      notify("Anime deleted");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const rows = (list.data ?? []).filter((a) =>
    q ? `${a.name} ${a.slug} ${a.aliases.join(" ")}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search anime…"
          style={{ maxWidth: 280 }}
        />
        <Btn onClick={() => setDraft(empty())}>Add anime</Btn>
      </div>

      {draft ? (
        <div className="surface-panel mt-5 rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold">
            {draft.id ? "Edit anime" : "New anime"}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <TextInput
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="Slug (auto from name if blank)">
              <TextInput
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </Field>
            <Field label="Aliases (comma separated)">
              <TextInput
                value={csv(draft.aliases)}
                onChange={(e) => setDraft({ ...draft, aliases: parseCsv(e.target.value) })}
              />
            </Field>
            <ImageField
              label="Artwork"
              folder="anime"
              value={draft.image_url ?? ""}
              onChange={(url) => setDraft({ ...draft, image_url: url })}
            />
          </div>
          <div className="mt-4">
            <Field label="Description">
              <TextArea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
          </div>
          <div className="mt-5 flex gap-3">
            <Btn disabled={save.isPending} onClick={() => save.mutate(draft)}>
              {save.isPending ? "Saving…" : "Save anime"}
            </Btn>
            <Btn variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Btn>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        {rows.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/50 p-3"
          >
            <img
              src={a.image_url || "/seed/clip-1.jpg"}
              alt=""
              className="h-12 w-20 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.name}</p>
              <p className="truncate text-xs text-muted-foreground">/{a.slug}</p>
            </div>
            <Btn variant="ghost" onClick={() => setDraft(a)}>
              Edit
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                if (confirm(`Delete “${a.name}”? Clips will keep their other metadata.`))
                  remove.mutate(a.id);
              }}
            >
              Delete
            </Btn>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No anime yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
