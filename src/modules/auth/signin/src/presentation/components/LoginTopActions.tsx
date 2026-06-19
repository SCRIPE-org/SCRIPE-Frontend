"use client";

import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useI18n } from "@core/providers/i18n-provider";

interface LoginTopActionsProps {
  skipLinkEnabled: boolean;
  ariaLandmarks: boolean;
}

/**
 * LoginTopActions — Floating top bar with docs link, language switcher, theme switcher.
 *
 * Extracted from LoginView to keep that view under 200 lines.
 * Also renders the optional skip-to-content link for WCAG AA compliance (§27).
 */
export function LoginTopActions({ skipLinkEnabled, ariaLandmarks }: LoginTopActionsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Skip-to-Content link (accessibility) */}
      {skipLinkEnabled && (
        <a href="#login-main-content" className="login-skip-link">
          {t("auth.a11y.skipToContent")}
        </a>
      )}

      <div
        className="absolute left-8 right-8 top-8 z-20 flex items-center justify-between gap-5 lg:justify-end"
        {...(ariaLandmarks
          ? { role: "navigation", "aria-label": t("auth.a11y.topActionsLabel") }
          : {})}
      >
        {/* Docs link (desktop only) */}
        {/* <Button
          variant="ghost"
          size="sm"
          className="hidden gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground lg:flex"
          asChild
        >
          <Link href="/docs">
            <BookOpen className="h-4 w-4" />
            {t("auth.branding.docs")}
          </Link>
        </Button> */}

        {/* <div className="hidden h-4 w-px bg-border lg:block" /> */}

        <div className="flex w-full items-center justify-between gap-1 lg:w-auto lg:justify-start">
          {/* Docs link (mobile) */}
          {/* <Button
            variant="ghost"
            size="sm"
            className="flex gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground lg:hidden"
            asChild
          >
            <Link href="/docs">
              <BookOpen className="h-4 w-4" />
              {t("auth.branding.docs")}
            </Link>
          </Button> */}

          <div className="flex gap-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
