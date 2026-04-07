"use client";

import { cva } from "class-variance-authority";
import { HTMLMotionProps, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const morphingSquareVariants = cva("flex items-center justify-center gap-3", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      top: "flex-col-reverse",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
});

export interface MorphingSquareProps {
  message?: string;
  /**
   * Position of the message relative to the spinner.
   * @default bottom
   */
  messagePlacement?: "top" | "bottom" | "left" | "right";
}

export function MorphingSquare({
  className,
  message,
  messagePlacement = "bottom",
  ...props
}: HTMLMotionProps<"div"> & MorphingSquareProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn(morphingSquareVariants({ messagePlacement }))}>
      <motion.div
        className={cn(
          "size-10 shrink-0 rounded-[6%] bg-linear-to-br from-primary via-[color-mix(in_oklab,var(--color-primary)_70%,white)] to-[color:color-mix(in_oklab,var(--color-primary)_78%,black)] shadow-[0_12px_30px_-12px_color-mix(in_oklab,var(--color-primary)_45%,transparent)]",
          className
        )}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                borderRadius: ["6%", "50%", "6%"],
                rotate: [0, 180, 360],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
        }
        {...props}
      />
      {message ? (
        <div className="text-center text-sm font-medium text-foreground">
          {message}
        </div>
      ) : null}
    </div>
  );
}
