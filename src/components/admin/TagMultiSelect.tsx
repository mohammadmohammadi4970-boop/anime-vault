import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

type TagRow = { id: string; name: string; slug: string };

/** Multi-select for picking clip tags from what's already registered in the
 * Tags admin tab, instead of free-typing them. Selected tags are stored as
 * plain name strings on the clip, same shape as before — this only changes
 * how they're picked. */
export function TagMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const tags = useQuery({
    queryKey: ["admin", "tags", "picker"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tags").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as TagRow[];
    },
  });

  const options = (tags.data ?? []).filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const toggle = (name: string) => {
    onChange(value.includes(name) ? value.filter((v) => v !== name) : [...value, name]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left text-sm outline-none focus:border-primary/50"
        >
          <span className={value.length ? "text-foreground" : "text-muted-foreground"}>
            {value.length > 0 ? value.join(", ") : "Select tags…"}
          </span>
          <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tags…"
          className="mb-2 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary/50"
        />
        <div className="max-h-64 space-y-0.5 overflow-y-auto">
          {tags.isLoading ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">Loading…</p>
          ) : options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              {tags.data?.length ? "No tags match." : "No tags yet — add some in the Tags tab."}
            </p>
          ) : (
            options.map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2"
              >
                <Checkbox checked={value.includes(t.name)} onCheckedChange={() => toggle(t.name)} />
                {t.name}
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
