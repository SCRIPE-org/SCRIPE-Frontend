"use client";

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
export function LoginTopActions({ skipLinkEnabled }: LoginTopActionsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Skip-to-Content link (accessibility) */}
      {skipLinkEnabled && (
        <a href="#login-main-content" className="login-skip-link">
          {t("auth.a11y.skipToContent")}
        </a>
      )}
    </>
  );
}
