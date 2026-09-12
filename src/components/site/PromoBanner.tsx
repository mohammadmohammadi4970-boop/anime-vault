import { Link } from "@tanstack/react-router";

import heroBanner from "@/assets/hero-banner.jpg";

export function PromoBanner() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border">
      <img
        src={heroBanner}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/90 via-background/70 to-background/95" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="ml-auto max-w-md text-right lg:pr-16">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            For editors. By fans.
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-[1.1] font-semibold sm:text-4xl">
            Turn moments into masterpieces.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            High-quality clips. No watermarks. Organized and easy to use.
          </p>
          <Link
            to="/requests"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-surface/80 px-5 py-2.5 text-sm font-medium text-primary-soft backdrop-blur transition-all hover:border-primary/60 hover:bg-surface"
          >
            Request a Clip →
          </Link>
        </div>
      </div>
    </section>
  );
}
