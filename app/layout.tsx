import { DirectionProvider } from "@/components/ui/direction";
import { getBaseUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: {
    default: "CLG | מערכת לידים חכמה בעברית",
    template: "%s | CLG",
  },
  description:
    "מערכת לידים חכמה בעברית לאיתור עסקים ולחיפוש לידים רלוונטיים. מחפשים עסקים, מציגים תוצאות מסודרות, ומתחילים לעבוד מהר יותר עם רשימת לידים מוכנה לפעולה.",
  keywords: [
    "מערכת לידים",
    "חיפוש לידים",
    "חיפוש עסקים",
    "איתור עסקים",
    "לידים רלוונטיים",
    "פלטפורמה בעברית",
    "ניהול לידים",
    "כלי לידים חכם",
    "לידים לעסקים",
    "חיפוש עסקים בעברית",
    "תוצאות מסודרות ללידים",
    "לידים מוכנים לפעולה",
  ],
  alternates: {
    canonical: "/",
    languages: {
      he: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "/",
    siteName: "CLG",
    title: "CLG | מערכת לידים חכמה בעברית",
    description:
      "מערכת לידים חכמה בעברית לאיתור עסקים, חיפוש לידים ותצוגת תוצאות מסודרת שמוכנה לעבודה.",
  },
  twitter: {
    card: "summary",
    title: "CLG | מערכת לידים חכמה בעברית",
    description:
      "מערכת לידים חכמה בעברית לאיתור עסקים, חיפוש לידים ותצוגת תוצאות מסודרת שמוכנה לעבודה.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='he'
      dir='rtl'
      className={cn(
        "h-full bg-background antialiased",
        geistSans.variable,
        geistMono.variable,
        jetbrainsMono.variable,
      )}>
      <body className='flex min-h-full flex-col bg-background text-foreground'>
        <DirectionProvider direction='rtl' dir='rtl'>
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}
