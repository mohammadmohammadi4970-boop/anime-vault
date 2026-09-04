import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Btn } from "./shared";
import { supabase } from "@/integrations/supabase/client";

type RequestRow = {
  id: string;
  anime_name: string;
  details: string;
  status: string;
  created_at: string;
};

export function RequestsTab({ notify }: { notify: (msg: string, kind?: "ok" | "error") => void }) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as RequestRow[];
    },
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "requests"] });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => notify(e.message, "error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      notify("Request removed");
      invalidate();
    },
    onError: (e: Error) => notify(e.message, "error"),
  });

  const rows = list.data ?? [];
  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {rows.length} total{newCount > 0 ? ` · ${newCount} new` : ""}
      </p>

      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-surface/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{r.anime_name}</p>
                {r.details ? (
                  <p className="mt-1 text-sm text-muted-foreground">{r.details}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] ${
                    r.status === "new"
                      ? "bg-primary/15 text-primary-soft"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {r.status}
                </span>
                {r.status === "new" ? (
                  <Btn
                    variant="ghost"
                    onClick={() => setStatus.mutate({ id: r.id, status: "reviewed" })}
                  >
                    Mark reviewed
                  </Btn>
                ) : null}
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm("Delete this request?")) remove.mutate(r.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No requests yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
