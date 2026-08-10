import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppProvider } from "@core/providers/app-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import "@modules/auth"; // Eagerly run component registrations
import "@modules/identity"; // Eagerly run identity registrations
import "@modules/customization"; // Eagerly run customization registrations
import "@modules/entitlements"; // Eagerly run entitlements registrations
import "@/modules/custom-fields/custom-fields/bootstrap"; // Registers the CustomFields GenericCrudView extension

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "SCRIPE", template: "%s | SCRIPE" },
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // R8: the locale cookie is the only signal readable at request time — the
  // client source of truth (I18nProvider's localStorage) doesn't exist yet on
  // the server. Reading it here lets <html lang dir> be correct on first paint
  // instead of relying on I18nProvider's post-mount effect to correct it, which
  // is what produced the RTL/LTR flash. Same cookie name as the localStorage
  // key I18nProvider already writes (see core/config/storage-keys.ts), kept in
  // sync by I18nProvider on every language change.
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(STORAGE_KEYS.LANGUAGE)?.value;
  const language = cookieLanguage === "ar" ? "ar" : "en";
  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    // I18nProvider's mount effect is idempotent against this value (compares
    // before writing), so a matching cookie means it never touches the DOM;
    // suppressHydrationWarning covers the rare case where localStorage disagrees
    // with the cookie and the effect corrects it after hydration.
    <html lang={language} dir={direction} suppressHydrationWarning>
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
