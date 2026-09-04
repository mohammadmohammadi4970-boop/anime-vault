import { Link } from "@tanstack/react-router";
import { Globe, Instagram, MessageCircle, Music2, Twitter, Youtube } from "lucide-react";

import type { FooterContent } from "@/data/types";

function socialIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("youtube")) return Youtube;
  if (l.includes("instagram")) return Instagram;
  if (l.includes("twitter") || l === "x" || l.includes(" x")) return Twitter;
  if (l.includes("discord")) return MessageCircle;
  if (l.includes("tiktok")) return Music2;
  return Globe;
}

export function Footer({
  content,
  logoUrl,
}: {
  content?: FooterContent | undefined;
  logoUrl?: string | undefined;
}) {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <span aria-hidden className="h-8 w-[3px] rounded-full bg-primary" />
            )}
            <span className="leading-none">
              <span className="block font-display text-base font-bold tracking-wide uppercase">
                Kuragawa
              </span>
              <span className="mt-0.5 block text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                Anime Clips
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {content?.description ??
              "High-quality anime clips for editors, creators and fans. Anime clips. Higher standards."}
          </p>

          {content?.socialLinks && content.socialLinks.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {content.socialLinks
                .filter((s) => s.url)
                .map((s) => {
                  const Icon = socialIcon(s.label);
                  return (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label || "Social link"}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <Icon aria-hidden className="h-4 w-4" />
                    </a>
                  );
                })}
            </div>
          ) : null}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/browse" className="transition-colors hover:text-foreground">
                Browse
              </Link>
            </li>
            <li>
              <Link to="/anime" className="transition-colors hover:text-foreground">
                Anime
              </Link>
            </li>
            <li>
              <Link to="/categories" className="transition-colors hover:text-foreground">
                Categories
              </Link>
            </li>
            <li>
              <Link
                to="/search"
                search={{ q: "" }}
                className="transition-colors hover:text-foreground"
              >
                Search
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Legal</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="transition-colors hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                Terms of Service
              </Link>
            </li>
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
