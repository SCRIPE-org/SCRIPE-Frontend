import type React from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { AppProvider } from "@core/providers/app-provider";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { BRAND } from "@core/config/branding";
import type {
  ColorTheme,
  DarkBackgroundTheme,
  FontSize,
  LightBackgroundTheme,
  SecondaryColorTheme,
} from "@core/settings/types";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "SCRIPE", template: "%s | SCRIPE" },
  description: "Professional SCRIPE with multi-language support",
  keywords: ["SCRIPE", "administration", "system"],
  authors: [{ name: "SCRIPE Team" }],
  creator: "SCRIPE",
  publisher: "SCRIPE",
  icons: {
    icon: [
      { url: "/brand/favicon.ico" },
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "SCRIPE",
    description: "Professional SCRIPE with multi-language support",
    url: `https://${BRAND.domain}`,
    siteName: "SCRIPE",
    images: [
      {
        url: "/brand/app-logo-1024.png",
        width: 1024,
        height: 1024,
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
    images: ["/brand/app-logo-1024.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D10" },
  ],
};

// Pre-paint hydration script: executes synchronously in <head> before <body>
// paints or next-themes mounts, aligning the 3-tier theme chain
// (localStorage.theme > scr_pref_theme > "system") and initial dark/light
// surface tokens without SSR/CSR mismatch or flash of navy/unstyled frames.
const VALID_COLOR_THEMES: Record<ColorTheme, 1> = {
  scripe: 1,
  purple: 1,
  blue: 1,
  green: 1,
  orange: 1,
  red: 1,
  teal: 1,
  pink: 1,
  indigo: 1,
  cyan: 1,
  amber: 1,
  yellow: 1,
  lime: 1,
  emerald: 1,
  sky: 1,
  violet: 1,
  fuchsia: 1,
  rose: 1,
  slate: 1,
  zinc: 1,
  stone: 1,
  gold: 1,
  coral: 1,
};

const VALID_SECONDARY_THEMES: Record<SecondaryColorTheme, 1> = VALID_COLOR_THEMES;

const VALID_LIGHT_BG_THEMES: Record<LightBackgroundTheme, 1> = {
  scripe: 1,
  default: 1,
  warm: 1,
  cool: 1,
  neutral: 1,
  soft: 1,
  cream: 1,
  mint: 1,
  lavender: 1,
  rose: 1,
  sky: 1,
  sand: 1,
  pearl: 1,
  ice: 1,
  linen: 1,
  cloud: 1,
  snow: 1,
};

const VALID_DARK_BG_THEMES: Record<DarkBackgroundTheme, 1> = {
  scripe: 1,
  default: 1,
  darker: 1,
  pitch: 1,
  slate: 1,
  "warm-dark": 1,
  forest: 1,
  ocean: 1,
  "purple-dark": 1,
  crimson: 1,
  midnight: 1,
  charcoal: 1,
  obsidian: 1,
  navy: 1,
  graphite: 1,
  onyx: 1,
  volcanic: 1,
};

const PRE_PAINT_FONT_SIZES: Record<FontSize, string> = {
  xs: "13px",
  small: "14px",
  medium: "16px",
  default: "18px",
  large: "20px",
  xl: "22px",
};

const PRE_PAINT_INIT_SCRIPT = `(function() {
  try {
    var root = document.documentElement;
    var ls = window.localStorage;
    var hasOwn = Object.prototype.hasOwnProperty;
    try { ls.removeItem("scr_admin_prefs_version"); } catch (e) {}

    var isValidTheme = function(v) {
      return v === "light" || v === "dark" || v === "system";
    };
    var rawTheme = ls.getItem("theme");
    var theme = isValidTheme(rawTheme) ? rawTheme : null;
    if (!theme) {
      var prefTheme = ls.getItem(${JSON.stringify(STORAGE_KEYS.PREF_THEME)});
      if (isValidTheme(prefTheme)) {
        try { ls.setItem("theme", prefTheme); } catch (e) {}
        theme = prefTheme;
      }
    }
    var resolvedTheme = (!theme || theme === "system")
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

    root.classList.remove("light", "dark");
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    }

    root.setAttribute("data-layout", "nexus");

    var rawPref = ls.getItem(${JSON.stringify(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS)});
    var rawUser = ls.getItem(${JSON.stringify(STORAGE_KEYS.DASHBOARD_SETTINGS)});
    var prefCfg = rawPref ? JSON.parse(rawPref) : null;
    var userCfg = rawUser ? JSON.parse(rawUser) : null;

    var allowedCfgKeys = {
      darkBackgroundTheme: 1,
      lightBackgroundTheme: 1,
      secondaryColorTheme: 1,
      colorTheme: 1,
      colorThemeCustomized: 1,
      highContrast: 1,
      reducedMotion: 1,
      fontSize: 1
    };
    var cfg = Object.create(null);
    var copySafe = function(src) {
      if (!src || typeof src !== "object" || Array.isArray(src)) return;
      var keys = Object.keys(src);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
        if (!hasOwn.call(src, k) || !hasOwn.call(allowedCfgKeys, k)) continue;
        cfg[k] = src[k];
      }
    };
    copySafe(prefCfg);
    copySafe(userCfg);

    var validDarkBg = ${JSON.stringify(VALID_DARK_BG_THEMES)};
    var validLightBg = ${JSON.stringify(VALID_LIGHT_BG_THEMES)};
    var validColorThemes = ${JSON.stringify(VALID_COLOR_THEMES)};
    var validSecondaryThemes = ${JSON.stringify(VALID_SECONDARY_THEMES)};
    var fontSizes = ${JSON.stringify(PRE_PAINT_FONT_SIZES)};

    root.setAttribute(
      "data-dark-bg-theme",
      typeof cfg.darkBackgroundTheme === "string" && hasOwn.call(validDarkBg, cfg.darkBackgroundTheme)
        ? cfg.darkBackgroundTheme
        : "default"
    );
    root.setAttribute(
      "data-light-bg-theme",
      typeof cfg.lightBackgroundTheme === "string" && hasOwn.call(validLightBg, cfg.lightBackgroundTheme)
        ? cfg.lightBackgroundTheme
        : "default"
    );
    root.setAttribute(
      "data-secondary-theme",
      typeof cfg.secondaryColorTheme === "string" && hasOwn.call(validSecondaryThemes, cfg.secondaryColorTheme)
        ? cfg.secondaryColorTheme
        : "lime"
    );

    var shouldApplyColorTheme =
      cfg.colorThemeCustomized === true ||
      (cfg.colorThemeCustomized === undefined && hasOwn.call(cfg, "colorTheme"));
    if (
      shouldApplyColorTheme &&
      typeof cfg.colorTheme === "string" &&
      hasOwn.call(validColorThemes, cfg.colorTheme)
    ) {
      root.setAttribute("data-theme", cfg.colorTheme);
    } else {
      root.removeAttribute("data-theme");
    }

    if (cfg.highContrast === true) {
      root.setAttribute("data-high-contrast", "true");
    }
    if (cfg.reducedMotion === true) {
      root.setAttribute("data-reduced-motion", "true");
    }

    if (typeof cfg.fontSize === "string" && hasOwn.call(fontSizes, cfg.fontSize)) {
      root.style.setProperty("--font-size-base", fontSizes[cfg.fontSize]);
    }
  } catch (e) {}
})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // R8: the locale cookie is the only signal readable at request time — the
  // client source of truth (I18nProvider's localStorage) doesn't exist yet on
  // the server. Reading it here lets <html lang dir> and <body> font class be
  // correct on first paint AND keeps I18nProvider's initial render identical to
  // SSR, eliminating React hydration mismatches.
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(STORAGE_KEYS.LANGUAGE)?.value;
  const language = cookieLanguage === "ar" ? "ar" : "en";
  const direction = language === "ar" ? "rtl" : "ltr";
  const fontClass = language === "ar" ? "font-arabic" : "font-english";

  return (
    // I18nProvider's mount effect reconciles localStorage overrides if the
    // client differs from the cookie (legacy sessions without the cookie).
    <html lang={language} dir={direction} suppressHydrationWarning>
      <head>
        <script
          id="scripe-pre-paint"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: PRE_PAINT_INIT_SCRIPT }}
        />
        {/* P1.11: Preconnect to shared API server */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} crossOrigin="anonymous" />
      </head>
      <body className={`${fontClass} font-sans antialiased`} suppressHydrationWarning>
        <AppProvider initialLanguage={language}>{children}</AppProvider>
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
