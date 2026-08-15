"use client";

/**
 * PasswordExpiryBanner — Warning banner when password is close to expiry
 */
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle } from "lucide-react";
import { formatDateUtc } from "@core/common/utils";
import { Alert, AlertDescription } from "@core/ui/alert";

interface PasswordExpiryBannerProps {
  isExpired: boolean;
  daysRemaining: number | null;
  passwordLastChanged: Date | null;
}

/**
 * Presentation UI component rendering the password expiry banner.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PasswordExpiryBanner({
  isExpired,
  daysRemaining,
  passwordLastChanged,
}: PasswordExpiryBannerProps) {
  const { t } = useI18n();

  if (!isExpired && (daysRemaining === null || daysRemaining > 30)) return null;

  return (
    <Alert variant={isExpired ? "destructive" : "warning"}>
      <AlertTriangle aria-hidden="true" />
      <AlertDescription>
        <p className="font-medium text-nx-ink">
          {isExpired
            ? t("profile.security.passwordExpired")
            : t("profile.security.passwordExpiringSoon", {
                days: String(daysRemaining ?? 0),
              })}
        </p>
        {passwordLastChanged && (
          <p className="mt-0.5 text-xs text-nx-ink-2">
            {t("profile.security.lastChanged")}: {formatDateUtc(passwordLastChanged)}
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
