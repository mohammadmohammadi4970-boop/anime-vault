import { useEffect, useRef, useState } from "react";

/** Fades/slides a section into view the first time it scrolls into the
 * viewport. Cheap (IntersectionObserver + CSS transition only), and does
 * nothing but render children plainly if the browser prefers reduced motion
 * or doesn't support IntersectionObserver. */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setSkip(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSkip(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${skip || visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
}
