"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground className='h-[420px] overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/70'>
      <div className='text-center text-3xl font-bold md:text-6xl dark:text-white'>
        שכבת רקע דינמית יכולה להרים מסך שלם.
      </div>
      <div className='max-w-2xl py-2 text-base font-extralight dark:text-neutral-200 md:text-2xl'>
        שילבנו את אפקט ה-aurora כרכיב מוכן לשימוש שמתאים גם למקטעי hero וגם
        לבלוקים שיווקיים בתוך האפליקציה.
      </div>
      <Button size='lg' className='rounded-full shadow-sm'>
        בדקו את האפקט
      </Button>
    </AuroraBackground>
  );
}
