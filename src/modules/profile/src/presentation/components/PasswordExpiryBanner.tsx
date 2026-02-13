"use client";

/**
 * PasswordExpiryBanner — Warning banner when password is close to expiry
 */
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle } from "lucide-react";
import { cn } from "@core/common/utils";

interface PasswordExpiryBannerProps {
      isExpired: boolean;
      daysRemaining: number | null;
      passwordLastChanged: Date | null;
}

export function PasswordExpiryBanner({
      isExpired,
      daysRemaining,
      passwordLastChanged,
}: PasswordExpiryBannerProps) {
      const { t } = useI18n();

      if (!isExpired && (daysRemaining === null || daysRemaining > 30)) return null;

      return (
            <div
                  className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border",
                        isExpired
                              ? "bg-destructive/10 border-destructive/20 text-destructive"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                  )}
            >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-sm">
                        <p className="font-medium">
                              {isExpired
                                    ? t("profile.security.passwordExpired")
                                    : t("profile.security.passwordExpiringSoon", {
                                          days: String(daysRemaining ?? 0),
                                    })}
                        </p>
                        {passwordLastChanged && (
                              <p className="text-xs mt-0.5 opacity-80">
                                    {t("profile.security.lastChanged")}: {passwordLastChanged.toLocaleDateString()}
                              </p>
                        )}
                  </div>
            </div>
      );
}
