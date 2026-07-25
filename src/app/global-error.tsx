"use client";

import { useEffect, useState } from "react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { handleError } from "@core/common/error-handler";
import { appLogger } from "@core/common/logger";
import { ar } from "@core/locales/ar";
import { en } from "@core/locales/en";
import { STORAGE_KEYS } from "@core/config/storage-keys";

// Translation function that takes language as parameter
const getTranslations = (language: "ar" | "en") => {
  return language === "en" ? en : ar;
};

const t = (key: string, language: "ar" | "en"): string => {
  const translations = getTranslations(language);
  const keys = key.split(".");
  let value: Record<string, unknown> | string = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k] as Record<string, unknown> | string;
    } else {
      return key; // Return the key if path not found
    }
  }

  return typeof value === "string" ? value : key;
};

// This file replaces the ENTIRE root layout when a root-level render error
// occurs, so none of its providers (ThemeProvider, AppProvider) are mounted —
// next-themes' own flash-prevention script never runs here either. Next.js
// requires global-error to be a Client Component, which also rules out
// reading the theme server-side via next/headers `cookies()` the way the root
// layout does for locale (R8). This is the client-side equivalent: a script
// that runs synchronously as the document is parsed, before body paints, so
// a dark-theme user hitting a fatal error never sees a white flash on top of
// whatever else broke. Mirrors ThemeProvider's own fallback chain exactly
// (core/providers/theme-provider.tsx): localStorage["theme"] (next-themes'
// own default key) → STORAGE_KEYS.PREF_THEME (tenant default) → system.
const THEME_NOFLASH_SCRIPT = `
(function () {
  try {
    var explicit = localStorage.getItem("theme");
    var tenantPref = localStorage.getItem("${STORAGE_KEYS.PREF_THEME}");
    var resolved = explicit || tenantPref || "system";
    var isDark =
      resolved === "dark" ||
      (resolved === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function GlobalError({
  error,
  reset: _reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [language] = useState<"ar" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === "en" || saved === "ar") return saved;
    }
    return "ar";
  });

  useEffect(() => {
    // Use centralized error handling
    const appError = handleError(error, "GlobalError");
    appLogger.error("Global error:", { error, appError });
  }, [error]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <html lang={language} dir={language === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_NOFLASH_SCRIPT }}
        />
      </head>
      <body suppressHydrationWarning>
        <div className="flex min-h-screen items-center justify-center bg-nx-ground p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl font-semibold">
                {t("errors.boundary.title", language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-nx-ink-2">
                {t("errors.boundary.description", language)}
              </p>

              {process.env.NODE_ENV === "development" && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-nx-ink-2">
                    {t("errors.boundary.details", language)}
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-nx-md bg-nx-raised p-3 text-xs">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                    {error.digest && `\n\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1" variant="outline">
                  <RefreshCw className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("errors.boundary.retry", language)}
                </Button>
                <Button onClick={handleGoHome} className="flex-1">
                  <Home className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("errors.boundary.home", language)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
