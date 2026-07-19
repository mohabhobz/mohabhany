"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DURATION, EASE_OUT, REVEAL } from "@/lib/motion";

type Props = {
  children: ReactNode;
  /** Stagger step. 0 to 4, matching the scale in lib/motion. */
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
  as?: "div" | "section" | "article" | "li";
};

/**
 * The ONLY scroll reveal in this project. Every animated arrival on the
 * site goes through here, so there is one place to change the feel of the
 * whole page and no chance of two sections drifting apart.
 *
 * Animates transform and opacity only. Both are composited on the GPU, so
 * a page of these costs nothing; animating height, top or margin instead
 * would force layout on every frame.
 *
 * `once: true` because a section that re-animates every time it scrolls
 * back into view stops being an entrance and becomes a distraction.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) return <MotionTag className={className}>{children}</MotionTag>;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: REVEAL.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: REVEAL.amount }}
      transition={{
        duration: DURATION.slow,
        ease: EASE_OUT,
        delay: delay * REVEAL.stagger,
      }}
    >
      {children}
    </MotionTag>
  );
}
