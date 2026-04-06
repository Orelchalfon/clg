"use client";

import { LeadsTable } from "@/components/leads/leads-table";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import type { Lead } from "@/types/lead";
import { Star } from "lucide-react";
import { SubmitEvent, useMemo, useState } from "react";
type ApiResponse = {
  leads?: Lead[];
  error?: string;
};

export default function HomePage() {
  const [businessType, setBusinessType] = useState("יועץ משכנתאות");
  const [desiredAmount, setDesiredAmount] = useState(30);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const hasResults = useMemo(() => leads.length > 0, [leads]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLeads([]);
    setHasSearched(true);
    setIsLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType,
          desiredAmount,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch leads");
      }

      setLeads(data.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuroraBackground>
      <main
        className='relative min-h-screen overflow-hidden  px-4 py-8 sm:px-6 lg:px-8'
        dir='rtl'>
        <div className='relative mx-auto max-w-6xl space-y-6'>
          <Hero />
          <section className='overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/70  shadow-sm backdrop-blur-sm'>
            <div className='grid gap-8 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:px-8 lg:py-8'>
              <div className='space-y-5'>
                <div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                  מכונת לידים מבוססת בינה מלאכותית <Star />
                </div>
                <header className='space-y-3'>
                  <h1 className='max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                    מערכת חיפוש לידים עם חוויית עבודה נקייה ומהירה יותר
                  </h1>
                  <p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
                    חפש עסקים ללא אתר, קבל תוצאות מסודרות בטבלה רספונסיבית, ושנה
                    רוחב עמודות תוך כדי עבודה בלי לצאת מהמסך.
                  </p>
                </header>
              </div>
              <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
                <div className='rounded-[calc(var(--radius)*1.35)] border border-border/70 bg-background/80 p-4'>
                  <div className='text-xs font-medium text-muted-foreground'>
                    סוג חיפוש
                  </div>
                  <div className='mt-2 text-lg font-semibold text-foreground'>
                    {businessType}
                  </div>
                </div>
                <div className='rounded-[calc(var(--radius)*1.35)] border border-border/70 bg-background/80 p-4'>
                  <div className='text-xs font-medium text-muted-foreground'>
                    כמות מבוקשת
                  </div>
                  <div className='mt-2 text-lg font-semibold text-foreground'>
                    {desiredAmount}
                  </div>
                </div>
                <div className='rounded-[calc(var(--radius)*1.35)] border border-border/70 bg-background/80 p-4'>
                  <div className='text-xs font-medium text-muted-foreground'>
                    לידים בטבלה
                  </div>
                  <div className='mt-2 text-lg font-semibold text-foreground'>
                    {leads.length}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className='rounded-[calc(var(--radius)*2)] border border-border/70 bg-card shadow-sm'>
            <form
              id='lead-search'
              onSubmit={handleSubmit}
              className='grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_180px_160px] lg:px-8'>
              <div className='space-y-2'>
                <label
                  htmlFor='businessType'
                  className='block text-sm font-medium text-foreground'>
                  סוג עסק
                </label>
                <input
                  id='businessType'
                  type='text'
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder='למשל: "יועץ משכנתאות" או "מאלף כלבים"'
                  className='w-full rounded-[calc(var(--radius)*1.1)] border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15'
                />
              </div>
              <div className='space-y-2'>
                <label
                  htmlFor='desiredAmount'
                  className='block text-sm font-medium text-foreground'>
                  כמות לידים
                </label>
                <input
                  id='desiredAmount'
                  type='number'
                  min={1}
                  max={100}
                  value={desiredAmount}
                  onChange={(e) => setDesiredAmount(Number(e.target.value))}
                  className='w-full rounded-[calc(var(--radius)*1.1)] border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15'
                />
              </div>
              <div className='flex items-end'>
                <Button
                  type='submit'
                  disabled={isLoading}
                  size='lg'
                  className='w-full rounded-[calc(var(--radius)*1.1)] shadow-sm'>
                  {isLoading ? "טוען..." : "חפש לידים"}
                </Button>
              </div>
            </form>
          </section>
          {isLoading && (
            <section
              aria-live='polite'
              className='flex items-center justify-center gap-3 rounded-[calc(var(--radius)*2)] border border-border/70 bg-card px-6 py-8 text-sm text-muted-foreground shadow-sm'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary' />
              <span className='font-medium text-foreground'>
                מבצע חיפוש ומביא נתונים...
              </span>
            </section>
          )}
          {error && (
            <section
              role='alert'
              className='rounded-[calc(var(--radius)*2)] border border-destructive/25 bg-destructive/8 px-5 py-4 text-sm text-destructive shadow-sm'>
              {error}
            </section>
          )}
          {!isLoading && hasSearched && !error && !hasResults && (
            <section className='rounded-[calc(var(--radius)*2)] border border-dashed border-border bg-card/70 px-6 py-10 text-center shadow-sm'>
              <h2 className='text-lg font-semibold text-foreground'>
                לא נמצאו לידים בחיפוש הזה
              </h2>
              <p className='mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground'>
                אפשר לנסות ניסוח מעט שונה לסוג העסק או להגדיל את כמות הלידים
                המבוקשת כדי לקבל יותר תוצאות פוטנציאליות.
              </p>
            </section>
          )}
          {!isLoading && hasResults && (
            <section className='space-y-4'>
              <div className='flex flex-col gap-3 rounded-[calc(var(--radius)*2)] border border-border/70 bg-card px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-6'>
                <div className='space-y-1'>
                  <h2 className='text-xl font-semibold text-foreground'>
                    תוצאות החיפוש
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    הטבלה מותאמת לגלילה אופקית במובייל וניתנת לשינוי רוחב עמודות
                    במסכי דסקטופ.
                  </p>
                </div>
                <div className='inline-flex items-center self-start rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground sm:self-auto'>
                  {leads.length} לידים
                </div>
              </div>
              <LeadsTable leads={leads} />
            </section>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
