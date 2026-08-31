import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Btn, Field, ImageField, TextArea, TextInput, csv, parseCsv, slugify } from "./shared";
import { supabase } from "@/integrations/supabase/client";

type ClipRow = {
  id: string;
  title: string;
  slug: string;
  anime_id: string | null;
  category_id: string | null;
  character: string | null;
  character_aliases: string[];
  anime_aliases: string[];
  season: number | null;
  episode: number | null;
  tags: string[];
  description: string;
  thumbnail_url: string | null;
  screenshot_urls: string[];
  duration: number;
  resolution: string;
  format: string;
  download_url: string;
  published: boolean;
};

const empty = (): ClipRow => ({
  id: "",
  title: "",
  slug: "",
  anime_id: null,
  category_id: null,
  character: "",
  character_aliases: [],
  anime_aliases: [],
  season: null,
  episode: null,
  tags: [],
  description: "",
  thumbnail_url: "",
  screenshot_urls: [],
  duration: 0,
  resolution: "1080p",
  format: "MP4",
  download_url: "",
  published: false,
});

export function ClipsTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<ClipRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const clips = useQuery({
    queryKey: ["admin", "clips"],
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from("clips")
        .select("*")
        .order("created_at", { ascending: false });
      if (e) throw e;
      return (data ?? []) as ClipRow[];
    },
  });

  const anime = useQuery({
    queryKey: ["admin", "anime"],
    queryFn: async () => {
      const { data, error: e } = await supabase.from("anime").select("id, name").order("name");
      if (e) throw e;
      return data ?? [];
    },
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error: e } = await supabase.from("categories").select("id, name").order("name");
      if (e) throw e;
      return data ?? [];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin", "clips"] });
  };

  const save = useMutation({
    mutationFn: async (row: ClipRow) => {
      const { id, ...rest } = row;
      const payload = {
        ...rest,
        slug: rest.slug || slugify(rest.title),
        character: rest.character || null,
        thumbnail_url: rest.thumbnail_url || null,
      };
      const res = id
        ? await supabase.from("clips").update(payload).eq("id", id)
        : await supabase.from("clips").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      setDraft(null);
      setError(null);
      invalidate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("clips").delete().eq("id", id);
      if (e) throw e;
    },
    onSuccess: invalidate,
    onError: (e: Error) => setError(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async (row: ClipRow) => {
      const { error: e } = await supabase
        .from("clips")
        .update({ published: !row.published })
        .eq("id", row.id);
      if (e) throw e;
    },
    onSuccess: invalidate,
    onError: (e: Error) => setError(e.message),
  });

  const shots = draft?.screenshot_urls ?? [];
  const setShot = (i: number, url: string) => {
    if (!draft) return;
    const next = [...shots];
    next[i] = url;
    setDraft({ ...draft, screenshot_urls: next.filter((s, idx) => s || idx < next.length) });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{clips.data?.length ?? 0} clips</p>
        <Btn onClick={() => setDraft(empty())}>Add clip</Btn>
      </div>

      <div className="mt-3">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clips by title, character, or slug…"
        />
      </div>

      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}

      {draft ? (
        <div className="surface-panel mt-5 rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold">
            {draft.id ? "Edit clip" : "New clip"}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title">
              <TextInput
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field label="Slug (auto from title if blank)">
              <TextInput
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </Field>
            <Field label="Anime">
              <select
                value={draft.anime_id ?? ""}
                onChange={(e) => setDraft({ ...draft, anime_id: e.target.value || null })}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
              >
                <option value="">— none —</option>
                {(anime.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                value={draft.category_id ?? ""}
                onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
              >
                <option value="">— none —</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Character">
              <TextInput
                value={draft.character ?? ""}
                onChange={(e) => setDraft({ ...draft, character: e.target.value })}
              />
            </Field>
            <Field label="Character aliases (comma separated)">
              <TextInput
                value={csv(draft.character_aliases)}
                onChange={(e) =>
                  setDraft({ ...draft, character_aliases: parseCsv(e.target.value) })
                }
              />
            </Field>
            <Field label="Anime aliases (comma separated)">
              <TextInput
                value={csv(draft.anime_aliases)}
                onChange={(e) => setDraft({ ...draft, anime_aliases: parseCsv(e.target.value) })}
              />
            </Field>
            <Field label="Tags (comma separated)">
              <TextInput
                value={csv(draft.tags)}
                onChange={(e) => setDraft({ ...draft, tags: parseCsv(e.target.value) })}
              />
            </Field>
            <Field label="Season (optional)">
              <TextInput
                type="number"
                min={0}
                value={draft.season === null ? "" : String(draft.season)}
                onChange={(e) =>
                  setDraft({ ...draft, season: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Episode (optional)">
              <TextInput
                type="number"
                min={0}
                value={draft.episode === null ? "" : String(draft.episode)}
                onChange={(e) =>
                  setDraft({ ...draft, episode: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Duration (seconds)">
              <TextInput
                type="number"
                value={String(draft.duration)}
                onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Resolution">
              <TextInput
                value={draft.resolution}
                onChange={(e) => setDraft({ ...draft, resolution: e.target.value })}
              />
            </Field>
            <Field label="Format">
              <TextInput
                value={draft.format}
                onChange={(e) => setDraft({ ...draft, format: e.target.value })}
              />
            </Field>
            <Field label="Download URL (Google Drive)">
              <TextInput
                value={draft.download_url}
                onChange={(e) => setDraft({ ...draft, download_url: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Description">
              <TextArea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageField
              label="Thumbnail"
              folder="clips"
              value={draft.thumbnail_url ?? ""}
              onChange={(url) => setDraft({ ...draft, thumbnail_url: url })}
            />
            {[0, 1, 2].map((i) => (
              <ImageField
                key={i}
                label={`Screenshot ${i + 1}`}
                folder="clips"
                value={shots[i] ?? ""}
                onChange={(url) => setShot(i, url)}
              />
            ))}
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
            />
            Published
          </label>

          <div className="mt-5 flex gap-3">
            <Btn disabled={save.isPending} onClick={() => save.mutate(draft)}>
              {save.isPending ? "Saving…" : "Save clip"}
            </Btn>
            <Btn variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Btn>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        {(clips.data ?? [])
          .filter((c) => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (
              c.title.toLowerCase().includes(q) ||
              c.slug.toLowerCase().includes(q) ||
              (c.character ?? "").toLowerCase().includes(q)
            );
          })
          .map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/50 p-3"
          >
            <img
              src={c.thumbnail_url || "/seed/clip-1.jpg"}
              alt=""
              className="h-12 w-20 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.title}</p>
              <p className="truncate text-xs text-muted-foreground">/{c.slug}</p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] ${
                c.published ? "bg-primary/15 text-primary-soft" : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {c.published ? "Published" : "Draft"}
            </span>
            <Btn variant="ghost" onClick={() => togglePublish.mutate(c)}>
              {c.published ? "Unpublish" : "Publish"}
            </Btn>
            <Btn variant="ghost" onClick={() => setDraft({ ...c, character: c.character ?? "" })}>
              Edit
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                if (confirm(`Delete “${c.title}”?`)) remove.mutate(c.id);
              }}
            >
              Delete
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}
