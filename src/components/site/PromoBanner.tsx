import { Link } from "@tanstack/react-router";

import heroBanner from "@/assets/hero-banner.jpg";

/**
 * The banner image itself already has "Turn Moments Into Masterpieces",
 * the tagline, the Japanese character, and "Edit / Share / Inspire" baked
 * into its pixels — so this component adds nothing on top except a real,
 * working button, positioned as a % of the image (so it stays aligned at
 * any screen size) and sized by its own content so it never wraps.
 *
 * Do not add any other overlaid text here — the image already has it.
 * Do not change the container to a fixed height independent of its width;
 * the button's left/top percentages are calibrated against this exact
 * aspect ratio, and changing one without the other will misalign it.
 */
export function PromoBanner() {
  return (
    <section className="border-y border-border bg-background">
      <div className="relative mx-auto aspect-[2172/724] w-full max-w-5xl">
        <img
          src={heroBanner}
          alt="Turn moments into masterpieces. High-quality clips, no watermarks, organized and easy to use."
          className="absolute inset-0 h-full w-full object-cover"
        />

        <Link
          to="/requests"
          className="absolute flex items-center justify-center rounded-[0.5em] bg-primary font-semibold whitespace-nowrap text-primary-foreground transition-transform [-webkit-tap-highlight-color:transparent] hover:-translate-y-0.5 active:scale-[0.97]"
          style={{
            left: "52%",
            top: "61%",
            width: "18%",
            height: "16%",
            fontSize: "clamp(0.55rem, 1.3vw, 0.9rem)",
          }}
        >
          Request a Clip →
        </Link>
      </div>
    </section>
  );
}
