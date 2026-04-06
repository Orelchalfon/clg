"use client";

import type { ReactNode } from "react";
import React from "react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div>
      <div
        className={cn(
          "relative flex min-h-dvh flex-col items-center justify-center text-slate-950 transition-bg dark:bg-zinc-900",
          className,
        )}
        {...props}>
        <div className='absolute inset-0 overflow-hidden'>
          <div
            className={cn(
              `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            bg-size-[300%,200%]
            bg-position-[50%_50%,50%_50%]
            absolute -inset-2.5 opacity-50 blur-[10px] invert will-change-transform
            after:absolute after:inset-0 after:animate-aurora after:bg-fixed
            after:[background-image:var(--white-gradient),var(--aurora)]
            after:bg-size-[200%,100%]
            after:content-[""] after:mix-blend-difference
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            pointer-events-none dark:invert-0
          `,
              showRadialGradient &&
                "mask-[radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]",
            )}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className='relative flex flex-col items-center justify-center gap-4  px-4 text-center'>
          {children}
        </motion.div>
      </div>
    </div>
  );
};
