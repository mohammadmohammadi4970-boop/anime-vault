import { Link } from "@tanstack/react-router";

import heroBanner from "@/assets/hero-banner.jpg";

/**
 * The banner image itself already has "Turn Moments Into Masterpieces",
 * the tagline, and the Japanese/EDIT-SHARE-INSPIRE labels baked into its
 * pixels — so this component adds nothing on top except a real, working
 * button, positioned (as a % of the image) roughly where the original
 * "Join Kuragawa" button sits, so it lines up at any screen size.
 */
export function PromoBanner() {
  return (
    <section className="border-y border-border bg-background">
      <div className="relative mx-auto aspect-[2172/724] w-full max-w-7xl">
        <img
          src={heroBanner}
          alt="Turn moments into masterpieces. High-quality clips, no watermarks, organized and easy to use."
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Link
          to="/requests"
          className="absolute inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-primary font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          style={{
            left: "53.4%",
            top: "63.5%",
            width: "15.8%",
            height: "13.9%",
            fontSize: "clamp(0.7rem, 1.5vw, 1.05rem)",
            justifyContent: "center",
          }}
        >
          Request a Clip →
        </Link>
      </div>
    </section>
  );
}
