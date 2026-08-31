import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Btn, Field, TextInput, slugify } from "./shared";
import { supabase } from "@/integrations/supabase/client";

type TagRow = { id: string; name: string; slug: string };

export function TagsTab({ notify }: { notify: (msg: string, kind?: "ok" | "error") => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editing, setEditing] = useState<{ id: string; oldName: string; name: string } | null>(
    null,
  );

  const list = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as TagRow[];
    },
  });

  const usage = useQuery({
    queryKey: ["admin", "tag-usage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clips").select("tags");
      if (error) throw error;
      const counts = new Map<string, number>();
      for (const row of (data ?? []) as { tags: string[] }[])
        for (const t of row.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
      return counts;
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const create = useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Tag name is required");
      const { error } = await supabase.from("tags").insert({ name: trimmed, slug: slugify(trimmed) });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewTag("");
      notify("Tag created");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  /** Renames the tag record AND every clip that references it, so links stay intact. */
  const rename = useMutation({
    mutationFn: async ({ id, oldName, name }: { id: string; oldName: string; name: string }) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Tag name is required");
      const { error } = await supabase
        .from("tags")
        .update({ name: trimmed, slug: slugify(trimmed) })
        .eq("id", id);
      if (error) throw error;
      const { error: rpcError } = await supabase.rpc("rename_tag", {
        _old: oldName,
        _new: trimmed,
      });
      if (rpcError) throw rpcError;
    },
    onSuccess: () => {
      setEditing(null);
      notify("Tag renamed on every clip that used it");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      notify("Tag deleted");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const rows = (list.data ?? []).filter((t) =>
    q ? t.name.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tags…"
          style={{ maxWidth: 280 }}
        />
        <div className="flex items-end gap-3">
          <Field label="New tag">
            <TextInput
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. Twixtor"
            />
          </Field>
          <Btn disabled={create.isPending} onClick={() => create.mutate(newTag)}>
            {create.isPending ? "Adding…" : "Add tag"}
          </Btn>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Tags are reusable across clips. Renaming one here updates every clip that uses it.
      </p>

      <div className="mt-4 space-y-2">
        {rows.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface/50 p-3"
          >
            {editing?.id === t.id ? (
              <>
                <TextInput
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  style={{ maxWidth: 260 }}
                />
                <Btn disabled={rename.isPending} onClick={() => rename.mutate(editing)}>
                  {rename.isPending ? "Saving…" : "Save"}
                </Btn>
                <Btn variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Btn>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {usage.data?.get(t.name) ?? 0} clip(s)
                  </p>
                </div>
                <Btn
                  variant="ghost"
                  onClick={() => setEditing({ id: t.id, oldName: t.name, name: t.name })}
                >
                  Rename
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete tag “${t.name}”? Clips keep the text but lose the entry.`))
                      remove.mutate(t.id);
                  }}
                >
                  Delete
                </Btn>
              </>
            )}
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No tags yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
