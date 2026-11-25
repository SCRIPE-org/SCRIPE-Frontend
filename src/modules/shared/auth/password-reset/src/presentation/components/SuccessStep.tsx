"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import type { UsePasswordRecoveryViewModelReturn } from "../viewmodels/usePasswordRecoveryViewModel";

interface SuccessStepProps {
  vm: UsePasswordRecoveryViewModelReturn;
}

/**
 * Shared completion step for both magic-link dispatch confirmation and password reset success.
 * Preserves validated context (`_tenant`, `redirect`, `email`, `reset=success`) and ensures
 * any previous session purge runs before returning to `/login`.
 */
export function SuccessStep({ vm }: SuccessStepProps) {
  const { t } = useI18n();
  const isMagicLinkSent = vm.successReason === "magic-link-sent";

  return (
    <div className="sx-pop flex flex-col items-center gap-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "hsl(var(--success) / 0.12)",
          border: "1px solid hsl(var(--success) / 0.25)",
        }}
      >
        {isMagicLinkSent ? (
          <Mail className="h-7 w-7 text-nx-success" aria-hidden="true" />
        ) : (
          <CheckCircle className="h-7 w-7 text-nx-success" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--sx-text)" }}>
          {isMagicLinkSent ? t("auth.magicLinkSentTitle") : t("auth.resetSuccessTitle")}
        </h1>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
          {isMagicLinkSent
            ? t("auth.magicLinkSentSubtitle").replace("{{email}}", vm.email)
            : t("auth.resetSuccessSubtitle")}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <Button
          type="button"
          onClick={() => void vm.goToLogin()}
          className="h-12 w-full rounded-xl text-[15px] font-semibold text-nx-on-fill transition-all active:scale-[0.985]"
        >
          {isMagicLinkSent ? t("auth.backToLogin") : t("auth.goToLogin")}
        </Button>
        {vm.mode === "forgot" && (
          <Button
            type="button"
            variant="ghost"
            onClick={vm.restart}
            className="h-11 w-full rounded-xl text-[13px] font-medium transition-colors"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.tryAnotherEmail")}
          </Button>
        )}
      </div>
    </div>
  );
}
