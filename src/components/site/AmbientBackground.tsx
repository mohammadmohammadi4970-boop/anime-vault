import { useEffect, useState } from "react";

/** Fixed, full-viewport ambient layer: soft rotating light rays + drifting
 * particles, sitting behind every page. Purely decorative (aria-hidden),
 * pointer-events disabled so it never blocks clicks, and skipped entirely
 * for visitors who prefer reduced motion. */
export function AmbientBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
      <div className="hero-rays absolute inset-0 opacity-[0.12]" />
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className="hero-particle absolute block h-1 w-1 rounded-full bg-primary/80 shadow-[0_0_6px_1.5px_var(--primary)]"
          style={{
            left: `${5 + i * 9.5}%`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${12 + (i % 4) * 3}s`,
          }}
        />
      ))}
    </div>
  );
}
