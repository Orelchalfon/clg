import { HomePageClient } from "@/components/home/home-page-client";
import { getCanonicalPath } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "חיפוש לידים לעסקים בעברית",
  description:
    "חיפוש לידים חכם בעברית לאיתור עסקים רלוונטיים, הצגת תוצאות מסודרות, והתחלת עבודה מהירה עם רשימת לידים מוכנה לפעולה.",
  alternates: {
    canonical: getCanonicalPath("/"),
  },
  openGraph: {
    title: "חיפוש לידים לעסקים בעברית | CLG",
    description:
      "חיפוש לידים חכם בעברית לאיתור עסקים רלוונטיים, הצגת תוצאות מסודרות, והתחלת עבודה מהירה עם רשימת לידים מוכנה לפעולה.",
    url: getCanonicalPath("/"),
  },
  twitter: {
    title: "חיפוש לידים לעסקים בעברית | CLG",
    description:
      "חיפוש לידים חכם בעברית לאיתור עסקים רלוונטיים, הצגת תוצאות מסודרות, והתחלת עבודה מהירה עם רשימת לידים מוכנה לפעולה.",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
