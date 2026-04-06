"use client";

import { LeadsTable } from "@/components/leads/leads-table";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/ui/hero";
import { MorphingSquare } from "@/components/ui/morphing-square";
import type {
  Lead,
  LeadSearchProgress,
  LeadSearchStreamEvent,
} from "@/types/lead";
import { Star } from "lucide-react";
import Link from "next/link";
import {
  SubmitEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ApiErrorResponse = {
  error?: string;
};

const useCases = [
  {
    title: "למי המערכת מתאימה",
    description:
      "לצוותי שיווק, מכירות ונותני שירות שרוצים לאתר עסקים רלוונטיים ולבנות רשימת לידים בעברית בלי תהליך ידני כבד.",
  },
  {
    title: "מה מקבלים בחיפוש",
    description:
      "מערכת חיפוש לידים שמציגה תוצאות מסודרות בטבלה נוחה לסריקה, עם שדות שימושיים שמוכנים להמשך עבודה.",
  },
  {
    title: "איך מתחילים לעבוד",
    description:
      "מגדירים סוג עסק, בוחרים כמות לידים רצויה, ושולחים חיפוש כדי לקבל רשימת עסקים שאפשר להתחיל לעבור עליה מיד.",
  },
];

const createSearchKey = (businessType: string, desiredAmount: number) =>
  `${businessType.trim().replace(/\s+/g, " ").toLocaleLowerCase("he-IL")}::${desiredAmount}`;

const getProgressMessage = (progress: LeadSearchProgress | null) => {
  if (!progress) {
    return "מכין את החיפוש ומתחיל לאסוף לידים...";
  }

  const pageStatus =
    progress.completedQueries >= progress.totalQueries
      ? "מסיים את החיפוש"
      : "בודק תוצאות נוספות";

  return `${pageStatus} עבור "${progress.queryLabel}"`;
};

async function readLeadStream(
  response: Response,
  onEvent: (event: LeadSearchStreamEvent) => void,
) {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Streaming is not available for this response.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue;
      }

      onEvent(JSON.parse(trimmedLine) as LeadSearchStreamEvent);
    }
  }

  const finalChunk = buffer.trim();
  if (finalChunk) {
    onEvent(JSON.parse(finalChunk) as LeadSearchStreamEvent);
  }
}

export function HomePageClient() {
  const [businessType, setBusinessType] = useState("יועץ משכנתאות");
  const [desiredAmount, setDesiredAmount] = useState(10);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<LeadSearchProgress | null>(null);

  const requestAbortRef = useRef<AbortController | null>(null);
  const activeSearchKeyRef = useRef<string | null>(null);

  const hasResults = leads.length > 0;
  const progressMessage = useMemo(() => getProgressMessage(progress), [progress]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [isLoading]);

  useEffect(() => {
    return () => {
      requestAbortRef.current?.abort();
    };
  }, []);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedBusinessType = businessType.trim();
    const searchKey = createSearchKey(normalizedBusinessType, desiredAmount);

    if (
      isLoading &&
      activeSearchKeyRef.current &&
      activeSearchKeyRef.current === searchKey
    ) {
      return;
    }

    requestAbortRef.current?.abort();

    const abortController = new AbortController();
    requestAbortRef.current = abortController;
    activeSearchKeyRef.current = searchKey;

    let hasReplacedResults = false;
    let receivedDone = false;

    setError("");
    setHasSearched(true);
    setIsLoading(true);
    setProgress(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType: normalizedBusinessType,
          desiredAmount,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const data = (await response.json()) as ApiErrorResponse;
        throw new Error(data.error || "Failed to fetch leads");
      }

      await readLeadStream(response, (streamEvent) => {
        if (abortController.signal.aborted) {
          return;
        }

        switch (streamEvent.type) {
          case "progress":
            setProgress(streamEvent);
            return;
          case "lead":
            setProgress((currentProgress) =>
              currentProgress
                ? {
                    ...currentProgress,
                    leadCount: currentProgress.leadCount + 1,
                  }
                : currentProgress,
            );
            setLeads((currentLeads) => {
              if (!hasReplacedResults) {
                hasReplacedResults = true;
                return [streamEvent.lead];
              }

              return [...currentLeads, streamEvent.lead];
            });
            return;
          case "error":
            throw new Error(streamEvent.message);
          case "done":
            receivedDone = true;
            if (!hasReplacedResults && streamEvent.leadsFound === 0) {
              setLeads([]);
            }
            return;
        }
      });

      if (!receivedDone && !abortController.signal.aborted) {
        throw new Error("Lead search ended unexpectedly.");
      }
    } catch (err) {
      if (
        abortController.signal.aborted ||
        (err instanceof Error && err.name === "AbortError")
      ) {
        return;
      }

      setError(err instanceof Error ? err.message : "Unknown error");
      setProgress(null);
    } finally {
      if (requestAbortRef.current === abortController) {
        requestAbortRef.current = null;
      }

      if (activeSearchKeyRef.current === searchKey) {
        activeSearchKeyRef.current = null;
      }

      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  return (
    <main
      className='relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8'
      dir='rtl'>
      <div className='relative mx-auto max-w-6xl space-y-6'>
        <Hero />
        <section
          id='how-it-works'
          aria-labelledby='how-it-works-title'
          className='rounded-[calc(var(--radius)*2)] border border-border/70 bg-card/80 px-5 py-6 shadow-sm sm:px-6 lg:px-8'>
          <div className='max-w-3xl space-y-3'>
            <h2
              id='how-it-works-title'
              className='text-2xl font-semibold tracking-tight text-foreground'>
              איך מערכת הלידים עוזרת למצוא עסקים מתאימים
            </h2>
            <p className='text-sm leading-6 text-muted-foreground sm:text-base'>
              העמוד מרכז חיפוש לידים לעסקים בעברית, כך שאפשר להבין מהר למי הוא
              מתאים, איך מתחילים, ואילו תוצאות מתקבלות לפני שמתחילים לעבוד על
              הרשימה.
            </p>
          </div>

          <div className='mt-5 grid gap-4 md:grid-cols-3'>
            {useCases.map((item) => (
              <article
                key={item.title}
                className='rounded-[calc(var(--radius)*1.4)] border border-border/70 bg-background/80 p-4'>
                <h3 className='text-lg font-semibold text-foreground'>
                  {item.title}
                </h3>
                <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section
          aria-labelledby='lead-search-overview'
          className='overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/70 shadow-sm backdrop-blur-sm'>
          <div className='grid gap-8 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:px-8 lg:py-8'>
            <div className='space-y-5'>
              <div className='inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                מכונת לידים מבוססת בינה מלאכותית <Star aria-hidden='true' />
              </div>
              <header className='space-y-3'>
                <h2
                  id='lead-search-overview'
                  className='max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
                  מערכת חיפוש לידים לאיתור עסקים ולעבודה מהירה יותר
                </h2>
                <p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
                  חפשו עסקים לפי תחום, קבלו רשימת לידים מסודרת בטבלה רספונסיבית,
                  ועברו במהירות מחיפוש לידים לעבודה שוטפת במסך אחד.
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

        <section
          aria-labelledby='lead-search'
          className='rounded-[calc(var(--radius)*2)] border border-border/70 bg-card shadow-sm'>
          <div className='border-b border-border/70 px-5 py-5 sm:px-6 lg:px-8'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
              <div className='space-y-2'>
                <h2
                  id='lead-search'
                  className='text-2xl font-semibold tracking-tight text-foreground'>
                  התחילו חיפוש לידים בעברית
                </h2>
                <p
                  id='lead-search-description'
                  className='max-w-3xl text-sm leading-6 text-muted-foreground'>
                  הגדירו סוג עסק וכמות לידים רצויה כדי לאתר עסקים רלוונטיים
                  ולקבל תוצאות ברורות, נגישות ומוכנות להמשך עבודה.
                </p>
              </div>
              <a
                href='#how-it-works'
                className='text-sm font-medium text-primary underline-offset-4 hover:underline'>
                איך המערכת עובדת?
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            aria-describedby='lead-search-description'
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
                autoComplete='organization-title'
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
                inputMode='numeric'
                aria-describedby='desired-amount-hint'
                className='w-full rounded-[calc(var(--radius)*1.1)] border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15'
              />
              <p
                id='desired-amount-hint'
                className='text-xs text-muted-foreground'>
                אפשר לבחור בין 1 ל-100 לידים בכל חיפוש.
              </p>
            </div>
            <div className='flex items-end'>
              <Button
                type='submit'
                disabled={isLoading}
                size='lg'
                className='w-full rounded-[calc(var(--radius)*1.1)] shadow-sm'>
                <Link href='#loading-results' />
                {isLoading ? "מחפש לידים..." : "חפש לידים"}
              </Button>
            </div>
          </form>
        </section>

        {isLoading && (
          <section
            id='loading-results'
            aria-live='polite'
            aria-label='טעינת תוצאות לידים'
            className='rounded-[calc(var(--radius)*2)] border border-border/70 bg-card/95 px-6 py-8 shadow-sm'>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-4'>
                <MorphingSquare
                  message='מבצע חיפוש ומביא נתונים...'
                  className='size-11'
                />
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-foreground'>
                    {progressMessage}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {progress
                      ? `${progress.leadCount} לידים נמצאו עד עכשיו מתוך ${desiredAmount}`
                      : "מתחיל להריץ את החיפוש ולבדוק עסקים רלוונטיים."}
                  </p>
                </div>
              </div>
              <div className='grid gap-3 text-sm text-muted-foreground sm:min-w-56'>
                <div className='rounded-[calc(var(--radius)*1.1)] border border-border/70 bg-background/80 px-4 py-3'>
                  {progress
                    ? `נסרקו ${progress.scannedCount} עסקים`
                    : "מחבר את החיפוש למנוע האיתור"}
                </div>
                <div className='rounded-[calc(var(--radius)*1.1)] border border-border/70 bg-background/80 px-4 py-3'>
                  {progress
                    ? `הושלמו ${progress.completedQueries} מתוך ${progress.totalQueries} שאילתות`
                    : "התקדמות תוצג כאן ברגע הראשון של התוצאות"}
                </div>
              </div>
            </div>
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

        {hasResults && (
          <section aria-labelledby='search-results-title' className='space-y-4'>
            <div className='flex flex-col gap-3 rounded-[calc(var(--radius)*2)] border border-border/70 bg-card px-5 py-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:px-6'>
              <div className='space-y-1'>
                <h2
                  id='search-results-title'
                  className='text-xl font-semibold text-foreground'>
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
  );
}
