import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

export function SearchBar({
  initial = "",
  chips = [],
  size = "lg",
}: {
  initial?: string;
  chips?: string[];
  size?: "lg" | "md";
}) {
  const [term, setTerm] = useState(initial);
  const navigate = useNavigate();

  function go(q: string) {
    navigate({ to: "/search", search: { q } });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(term.trim());
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 transition-colors focus-within:border-primary/50 focus-within:glow-ring"
      >
        <label htmlFor="site-search" className="sr-only">
          Search for anime, characters, scenes
        </label>
        <Search aria-hidden className="ml-2 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        <input
          id="site-search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for anime, characters, scenes..."
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground ${
            size === "lg" ? "py-2.5 text-base" : "py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Search
        </button>
      </form>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Popular:</span>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => go(chip)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
