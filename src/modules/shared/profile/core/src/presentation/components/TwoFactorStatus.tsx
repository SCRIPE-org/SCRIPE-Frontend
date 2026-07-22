"use client";

/**
 * TwoFactorStatus — 2FA status card with enable/disable + backup code progress
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Shield, ShieldCheck, ShieldX, ShieldPlus } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { LoadingSpinner } from "@core/ui/loading-spinner";

interface TwoFactorStatusProps {
  isEnabled: boolean;
  backupCodesRemaining: number | null;
  onRegenerateBackupCodes: () => void;
  onEnable: () => void;
  onDisable: () => void;
  isEnabling?: boolean;
}

/**
 * Presentation UI component rendering the two factor status.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TwoFactorStatus({
  isEnabled,
  backupCodesRemaining,
  onRegenerateBackupCodes,
  onEnable,
  onDisable,
  isEnabling = false,
}: TwoFactorStatusProps) {
  const { t } = useI18n();
  const totalCodes = 10;
  const remaining = backupCodesRemaining ?? 0;
  const percentage = Math.round((remaining / totalCodes) * 100);

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-colors",
        isEnabled ? "border-success/20 bg-success/5" : "border-border/40 bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <ShieldCheck className="h-6 w-6 flex-shrink-0 text-success" />
          ) : (
            <ShieldX className="h-6 w-6 flex-shrink-0 text-muted-foreground" />
          )}
          <div>
            <h4 className="text-sm font-medium">{t("profile.security.twoFactor.title")}</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEnabled
                ? t("profile.security.twoFactor.enabled")
                : t("profile.security.twoFactor.disabled")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
            {isEnabled ? t("common.enabled") : t("common.disabled")}
          </Badge>
          {isEnabled ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDisable}
            >
              <ShieldX className="me-1.5 h-3.5 w-3.5" />
              {t("common.disable")}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onEnable} disabled={isEnabling}>
              {isEnabling ? (
                <LoadingSpinner size="inline" showText={false} />
              ) : (
                <ShieldPlus className="me-1.5 h-3.5 w-3.5" />
              )}
              {t("common.enable")}
            </Button>
          )}
        </div>
      </div>

      {isEnabled && backupCodesRemaining !== null && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t("profile.security.twoFactor.backupCodes")}
            </span>
            <span className="font-mono font-medium">
              {remaining} / {totalCodes}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                percentage > 50
                  ? "bg-success"
                  : percentage > 20
                    ? "bg-warning"
                    : "bg-destructive"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <Button variant="outline" size="sm" onClick={onRegenerateBackupCodes} className="mt-3">
            <Shield className="me-2 h-3.5 w-3.5" />
            {t("profile.security.twoFactor.regenerate")}
          </Button>
        </div>
      )}
    </div>
  );
}
