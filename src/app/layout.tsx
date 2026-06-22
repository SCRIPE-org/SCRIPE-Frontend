import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppProvider } from "@core/providers/app-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "SCRIPE",
  description: "Professional SCRIPE with multi-language support",
  keywords: ["SCRIPE", "next template", "administration", "system"],
  authors: [{ name: "SCRIPE Team" }],
  creator: "SCRIPE",
  publisher: "SCRIPE",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/app-logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "SCRIPE",
    description: "Professional SCRIPE with multi-language support",
    url: "https://app-name.com",
    siteName: "SCRIPE",
    images: [
      {
        url: "/app-logo.png",
        width: 512,
        height: 512,
        alt: "SCRIPE Logo",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SCRIPE",
    description: "Professional SCRIPE with multi-language support",
    images: ["/app-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // P2.2: lang/dir set dynamically by LanguageProvider via useEffect on <html>
    <html suppressHydrationWarning>
      <head>
        {/* P1.11: Preconnect to shared API server */}
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}
        />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
        {/* P5.1: Service Worker — deferred to afterInteractive (no longer render-blocking) */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                navigator.serviceWorker.register('/sw.js');
              }
            `,
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
