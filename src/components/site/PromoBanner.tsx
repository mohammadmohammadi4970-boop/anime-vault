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
          className="absolute inline-flex items-center gap-[0.35em] rounded-[0.5em] bg-primary px-[0.9em] py-[0.55em] font-semibold whitespace-nowrap text-primary-foreground transition-transform hover:-translate-y-0.5"
          style={{
            left: "53.4%",
            top: "68%",
            fontSize: "clamp(0.55rem, 1.05vw, 0.85rem)",
          }}
        >
          Request a Clip →
        </Link>
      </div>
    </section>
  );
}
