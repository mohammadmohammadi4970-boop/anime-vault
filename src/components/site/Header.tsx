import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/anime", label: "Anime" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
] as const;

export function Header({ logoUrl }: { logoUrl?: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    setOpen(false);
    navigate({ to: "/search", search: { q: term.trim() } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Kuragawa Clips home">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Kuragawa Clips"
                className="h-9 w-9 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 font-display text-lg font-bold text-primary-soft">
                K
              </span>
            )}
            <span className="truncate font-display text-base font-semibold tracking-tight">
              Kuragawa Clips
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={submit} className="hidden items-center md:flex">
            <label htmlFor="header-search" className="sr-only">
              Search clips
            </label>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 transition-colors focus-within:border-primary/50">
              <Search aria-hidden className="h-4 w-4 text-muted-foreground" />
              <input
                id="header-search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search clips..."
                className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground lg:w-52"
              />
            </div>
          </form>

          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
            aria-expanded={searchOpen}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <Search aria-hidden className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            {open ? <X aria-hidden className="h-4.5 w-4.5" /> : <Menu aria-hidden className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submit} className="border-t border-border px-4 py-3 md:hidden">
          <label htmlFor="mobile-search" className="sr-only">
            Search clips
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5">
            <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="mobile-search"
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search for anime, characters, scenes..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>
      )}

      {open && (
        <nav aria-label="Mobile" className="border-t border-border px-4 py-3 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  className="block rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  activeProps={{ className: "text-foreground" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
