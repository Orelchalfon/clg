import { DirectionProvider } from "@/components/ui/direction";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLG - מערכת לידים חכמה בעברית",
  description: "מערכת לידים חכמה בעברית שמרכזת חיפוש עסקים, מציגה תוצאות מסודרות, ועוזרת לכם להגיע מהר יותר לרשימת לידים שאפשר להתחיל לעבוד איתה.",
  keywords: [
    "מערכת לידים",
    "חיפוש עסקים",
    "לידים רלוונטיים",
    "פלטפורמה בעברית",
    "ניהול לידים",
    "כלי לידים חכם",
    "לידים לעסקים",
    "חיפוש עסקים בעברית",
    "תוצאות מסודרות ללידים",
    "לידים מוכנים לפעולה"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={cn(
        "h-full bg-background antialiased",
        geistSans.variable,
        geistMono.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <DirectionProvider direction="rtl" dir="rtl">
          {children}
        </DirectionProvider>
      </body>
    </html>
  );
}
