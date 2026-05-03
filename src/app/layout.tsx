import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valuora — Buy, Wait or Avoid",
  description:
    "Valuora uses AI to analyze any Amazon or Flipkart product URL and give you an instant BUY / WAIT / AVOID verdict — backed by price intelligence, review analysis, and trust scoring.",
  keywords: ["valuora", "amazon price tracker", "flipkart deals", "product analyzer", "buy or avoid", "price comparison india"],
  openGraph: {
    title: "Valuora — AI Product Decision Engine",
    description: "Stop guessing. Paste any product URL and get an instant AI verdict.",
    siteName: "Valuora",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('valuora-theme');
                if (t === 'light') document.documentElement.setAttribute('data-theme','light');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
