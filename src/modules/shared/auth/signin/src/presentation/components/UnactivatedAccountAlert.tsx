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
      className="flex flex-col gap-3 rounded-xl border border-info/30 bg-info/10 p-4 text-info duration-300 animate-in fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-info/20 text-info">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            {t("auth.accountSetup.activationRequiredTitle") || "Account Setup Required"}
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {accountNotActivatedMessage ||
              t("auth.accountSetup.activationRequiredDesc") ||
              "Your account is not active yet. A setup link was automatically sent to your email address."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-info/20 pt-2.5 text-xs">
        <span className="font-mono text-[11px] text-muted-foreground">
          {isCooldownActive
            ? `Resend available in ${cooldownSeconds}s`
            : "Didn't receive the email?"}
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
          <span>Resend Email</span>
        </Button>
      </div>
    </div>
  );
}
