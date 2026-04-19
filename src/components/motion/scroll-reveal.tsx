import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ScrollRevealVariant = "fade-up" | "fade-in" | "slide-left" | "zoom";

const variantClass: Record<ScrollRevealVariant, string> = {
  "fade-up": "scroll-reveal scroll-reveal--fade-up",
  "fade-in": "scroll-reveal scroll-reveal--fade-in",
  "slide-left": "scroll-reveal scroll-reveal--slide-left",
  zoom: "scroll-reveal scroll-reveal--zoom",
};

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger siblings with e.g. 80, 160, 240 ms */
  delayMs?: number;
  variant?: ScrollRevealVariant;
  /** Larger = triggers earlier before element enters view */
  rootMargin?: string;
};

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  variant = "fade-up",
  rootMargin = "0px 0px -10% 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
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
      { root: null, rootMargin, threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(variantClass[variant], visible && "scroll-reveal--visible", className)}
      style={
        reducedMotion
          ? undefined
          : {
              transitionDelay: `${delayMs}ms`,
            }
      }
    >
      {children}
    </div>
  );
}
