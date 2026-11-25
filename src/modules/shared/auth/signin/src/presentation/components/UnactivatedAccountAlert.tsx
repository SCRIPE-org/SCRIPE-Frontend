"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Mail } from "lucide-react";

/**
 * Documentation for module export
 */
export interface UnactivatedAccountAlertProps {
  t: (key: string) => string;
  accountNotActivatedMessage?: string;
  cooldownSeconds?: number;
  isLoading: boolean;
  onResendSetupEmail?: () => void;
}

/**
 * Presentation alert displayed when an account exists but has not completed activation.
 * Provides live feedback and a cooldown-governed resend action.
 * Adheres to WCAG with role="alert" and aria-live="polite".
 */
export function UnactivatedAccountAlert({
  t,
  accountNotActivatedMessage = "",
  cooldownSeconds = 0,
  isLoading,
  onResendSetupEmail,
}: UnactivatedAccountAlertProps) {
  const isCooldownActive = cooldownSeconds !== undefined && cooldownSeconds > 0;

  return (
    <div
      id="login-unactivated-alert"
      className="flex flex-col gap-3 rounded-xl border border-info/30 bg-info/10 p-4 text-nx-info duration-300 animate-in fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/20 text-nx-info">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-nx-ink">
            {t("auth.accountSetup.activationRequiredTitle")}
          </h4>
          <p className="text-xs leading-relaxed text-nx-ink-2">
            {accountNotActivatedMessage || t("auth.accountSetup.activationRequiredDesc")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-info/20 pt-2.5 text-xs">
        <span className="font-mono text-[11px] text-nx-ink-2">
          {isCooldownActive
            ? t("auth.accountSetup.resendAvailableIn").replace("{{seconds}}", String(cooldownSeconds))
            : t("auth.accountSetup.didNotReceiveEmail")}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || isCooldownActive}
          onClick={onResendSetupEmail}
          className="h-7 gap-1.5 border-info/30 text-xs hover:bg-info/15"
        >
          {isLoading ? (
            <LoadingSpinner className="h-3 w-3" />
          ) : (
            <Mail className="h-3 w-3" aria-hidden="true" />
          )}
          <span>{t("auth.accountSetup.resendEmailAction")}</span>
        </Button>
      </div>
    </div>
  );
}
