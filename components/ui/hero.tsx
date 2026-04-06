"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  MousePointerClick,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { renderCanvas } from "@/components/ui/canvas";
import { Button } from "@/components/ui/button";

const trustPoints = [
  "איתור עסקים רלוונטיים במהירות",
  "ממשק עבודה נקי בעברית מלאה",
  "תוצאות מסודרות ומוכנות לפעולה",
];

const stats = [
  { label: "חיפוש ממוקד", value: "RTL" },
  { label: "מוכן לעבודה", value: "היום" },
  { label: "פחות רעש", value: "יותר לידים" },
];

export function Hero() {
  useEffect(() => {
    return renderCanvas();
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[calc(var(--radius)*2.4)] border border-border/70 bg-card/95 shadow-sm">
      <canvas
        id="canvas"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-primary/12 via-primary/5 to-transparent" />
      <div className="pointer-events-none absolute -right-14 top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-secondary/70 blur-3xl" />

      <div className="relative grid gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:px-8 lg:py-10">
        <div className="space-y-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-3 py-1 text-xs font-medium text-primary shadow-xs backdrop-blur">
            <Sparkles className="size-3.5" />
            מערכת לידים חכמה לצוותים שעובדים מהר
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              מאתרים לידים רלוונטיים
              <span className="block text-primary">בלי לאבד זמן על עבודה ידנית</span>
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              פלטפורמה בעברית מלאה שמרכזת חיפוש עסקים, מציגה תוצאות בצורה מסודרת,
              ועוזרת לכם להגיע מהר יותר לרשימת לידים שאפשר להתחיל לעבוד איתה.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="rounded-[calc(var(--radius)*1.2)] shadow-sm">
              <Link href="#lead-search">
                התחילו חיפוש
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-[calc(var(--radius)*1.2)] bg-background/85 backdrop-blur"
            >
              <Link href="#results-preview">
                צפו בתצוגת התוצאות
                <SearchCheck className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[calc(var(--radius)*1.5)] border border-border/70 bg-background/80 px-4 py-3 backdrop-blur"
              >
                <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
                <div className="mt-2 text-lg font-semibold text-foreground">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[calc(var(--radius)*1.8)] border border-border/70 bg-background/85 p-5 shadow-xs backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BadgeCheck className="size-4 text-primary" />
              למה זה עובד טוב לצוותים בעברית
            </div>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            id="results-preview"
            className="rounded-[calc(var(--radius)*1.8)] border border-border/70 bg-background/85 p-5 shadow-xs backdrop-blur"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MousePointerClick className="size-4 text-primary" />
              תהליך עבודה קצר וברור
            </div>

            <div className="mt-4 grid gap-3">
              {[
                "מגדירים סוג עסק וכמות לידים רצויה",
                "שולחים חיפוש ומקבלים תוצאות מסודרות",
                "עוברים על הטבלה ומתחילים לפעול מיד",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-[calc(var(--radius)*1.3)] border border-border/60 bg-card px-4 py-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
