import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@core/providers/app-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "NEXORA",
  description: "Professional NEXORA with multi-language support",
  keywords: ["NEXORA", "next template", "administration", "system"],
  authors: [{ name: "NEXORA Team" }],
  creator: "NEXORA",
  publisher: "NEXORA",
  icons: {
    icon: [
      { url: "/app-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/app-logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/app-logo.png",
    apple: "/app-logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "NEXORA",
    description: "Professional NEXORA with multi-language support",
    url: "https://app-name.com",
    siteName: "NEXORA",
    images: [
      {
        url: "/app-logo.png",
        width: 512,
        height: 512,
        alt: "NEXORA Logo",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXORA",
    description: "Professional NEXORA with multi-language support",
    images: ["/app-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // P2.2: lang/dir set dynamically by LanguageProvider via useEffect on <html>
    <html suppressHydrationWarning>
      <head>
        {/* P1.11: Preconnect to shared API server (always the first API hit — auth, navigation).
            In microservice mode, module-specific endpoints (NEXT_PUBLIC_{MODULE}_API_URL) 
            connect lazily after route navigation, so preconnect for the shared base is sufficient. */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"} crossOrigin="anonymous" />
        {/* P5.1: Register Service Worker for PWA offline support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-cairo antialiased" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
