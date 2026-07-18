"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 0–4 — maps to the design system stagger step */
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
  as?: "div" | "section" | "article" | "li";
};

/**
 * The ONLY scroll-reveal in this project.
 * Animates transform + opacity only (60fps), respects reduced motion,
 * and uses the design-system duration/easing tokens.
 */
export function Reveal({ children, delay = 0, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  if (reduce) return <MotionTag className={className}>{children}</MotionTag>;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.8,
        ease: [0.2, 0.7, 0.2, 1],
        delay: delay * 0.07,
      }}
    >
      {children}
    </MotionTag>
  );
}
