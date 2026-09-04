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
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-background/55 to-background/85" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="ml-auto max-w-md text-right lg:pr-16">
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            For editors. By fans.
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-[1.1] font-semibold sm:text-5xl">
            Turn moments into masterpieces.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            High-quality clips. No watermarks. Organized and easy to use.
          </p>
          <Link
            to="/requests"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Request a Clip →
          </Link>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col items-center gap-6 text-muted-foreground sm:right-8 lg:flex"
      >
        <span className="font-serif text-3xl leading-none">創</span>
        <span className="font-serif text-3xl leading-none">る</span>
        <span className="mt-4 flex flex-col items-center gap-2 text-[10px] tracking-[0.2em] uppercase">
          <span>Edit</span>
          <span>Share</span>
          <span>Inspire</span>
        </span>
      </div>
    </section>
  );
}
