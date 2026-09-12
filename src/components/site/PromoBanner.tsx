import { Link } from "@tanstack/react-router";

import heroBanner from "@/assets/hero-banner.jpg";

/**
 * The banner image itself already has "Turn Moments Into Masterpieces",
 * the tagline, and the Japanese/EDIT-SHARE-INSPIRE labels baked into its
 * pixels — so this component adds nothing on top except:
 *  - a real, working button, centered on roughly where the original
 *    "Join Kuragawa" button sits (as a % of the image, so it stays
 *    aligned at any screen size), sized by its own content so it never
 *    wraps awkwardly
 *  - a small patch covering a typo baked into the source image
 *    ("FOOR EDITORS" → "FOR EDITORS"), redrawn correctly
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

        {/* Typo patch: covers the baked-in "FOOR EDITORS. BY FANS." with a
            correctly spelled label over the same flat dark background. */}
        <div
          aria-hidden
          className="absolute flex items-center bg-background"
          style={{ left: "53%", top: "22%", width: "20%", height: "4.5%" }}
        >
          <span className="text-[clamp(0.55rem,1vw,0.75rem)] whitespace-nowrap text-muted-foreground uppercase tracking-[0.3em]">
            For editors. By fans.
          </span>
        </div>

        <Link
          to="/requests"
          className="absolute inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-primary px-[1.1em] py-[0.65em] font-semibold whitespace-nowrap text-primary-foreground transition-transform hover:-translate-y-0.5"
          style={{
            left: "61.3%",
            top: "70.4%",
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(0.62rem, 1.4vw, 1rem)",
          }}
        >
          Request a Clip →
        </Link>
      </div>
    </section>
  );
}
