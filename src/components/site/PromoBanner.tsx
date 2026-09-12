import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

export function PromoBanner() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border">
      <img src={heroBanner} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 -z-10 bg-background/80" />
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Button asChild variant="outline" className="border-primary/40 bg-surface/80 text-primary-soft backdrop-blur hover:border-primary/60 hover:bg-surface">
          <Link to="/requests">Request a Clip →</Link>
        </Button>
      </div>
    </section>
  );
}
