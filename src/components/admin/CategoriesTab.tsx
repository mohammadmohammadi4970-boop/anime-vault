import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Btn, Field, TextArea, TextInput, slugify } from "./shared";
import { supabase } from "@/integrations/supabase/client";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

const empty = (): CategoryRow => ({ id: "", name: "", slug: "", description: "" });

export function CategoriesTab({
  notify,
}: {
  notify: (msg: string, kind?: "ok" | "error") => void;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<CategoryRow | null>(null);
  const [q, setQ] = useState("");

  const list = useQuery({
    queryKey: ["admin", "categories-full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const save = useMutation({
    mutationFn: async (row: CategoryRow) => {
      if (!row.name.trim()) throw new Error("Name is required");
      const { id, ...rest } = row;
      const payload = { ...rest, slug: rest.slug || slugify(rest.name) };
      const res = id
        ? await supabase.from("categories").update(payload).eq("id", id)
        : await supabase.from("categories").insert(payload);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      setDraft(null);
      notify("Category saved");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      notify("Category deleted");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const rows = (list.data ?? []).filter((c) =>
    q ? `${c.name} ${c.slug}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories…"
          style={{ maxWidth: 280 }}
        />
        <Btn onClick={() => setDraft(empty())}>Add category</Btn>
      </div>

      {draft ? (
        <div className="surface-panel mt-5 rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold">
            {draft.id ? "Edit category" : "New category"}
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
              {save.isPending ? "Saving…" : "Save category"}
            </Btn>
            <Btn variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Btn>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        {rows.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/50 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">/{c.slug}</p>
            </div>
            <Btn variant="ghost" onClick={() => setDraft(c)}>
              Edit
            </Btn>
            <Btn
              variant="danger"
              onClick={() => {
                if (confirm(`Delete “${c.name}”?`)) remove.mutate(c.id);
              }}
            >
              Delete
            </Btn>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No categories yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
