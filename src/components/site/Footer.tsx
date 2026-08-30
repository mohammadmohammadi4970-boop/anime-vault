import { Link } from "@tanstack/react-router";

import type { FooterContent } from "@/data/types";

export function Footer({ content }: { content?: FooterContent | undefined }) {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 font-display text-lg font-bold text-primary-soft">
              K
            </span>
            <span className="font-display text-base font-semibold">Kuragawa Clips</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {content?.description ??
              "High-quality anime clips for editors, creators and fans. Anime clips. Higher standards."}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/browse" className="transition-colors hover:text-foreground">Browse</Link></li>
            <li><Link to="/anime" className="transition-colors hover:text-foreground">Anime</Link></li>
            <li><Link to="/categories" className="transition-colors hover:text-foreground">Categories</Link></li>
            <li><Link to="/search" search={{ q: "" }} className="transition-colors hover:text-foreground">Search</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Legal</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li><Link to="/about" className="transition-colors hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="transition-colors hover:text-foreground">Contact</Link></li>
            <li><Link to="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {content?.copyright ?? "Kuragawa Clips. All rights reserved."}
          </p>
          <p>Made for anime editors.</p>
        </div>
      </div>
    </footer>
  );
}
