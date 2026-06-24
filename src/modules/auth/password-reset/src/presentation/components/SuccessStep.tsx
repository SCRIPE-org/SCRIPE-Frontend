// UI-EXCEPTION: compact studio layout
"use client";

import * as React from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import type { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

interface SuccessStepProps {
  vm: ReturnType<typeof useForgotPasswordViewModel>;
}

export function SuccessStep({ vm }: SuccessStepProps) {
  const { t } = useI18n();

  return (
    <div className="sx-pop flex flex-col items-center gap-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(16,185,129,0.12)",
          border: "1px solid rgba(16,185,129,0.25)",
        }}
      >
        {vm.method === "magic-link" ? (
          <Mail className="h-7 w-7 text-emerald-500" aria-hidden="true" />
        ) : (
          <CheckCircle className="h-7 w-7 text-emerald-500" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--sx-text)" }}>
          {vm.method === "magic-link" ? t("auth.magicLinkSentTitle") : t("auth.resetSuccessTitle")}
        </h2>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
          {vm.method === "magic-link"
            ? t("auth.magicLinkSentSubtitle").replace("{{email}}", vm.email)
            : t("auth.resetSuccessSubtitle")}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2.5">
        <Link href="/login" className="block">
          <Button className="h-12 w-full rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985]">
            {vm.method === "magic-link" ? t("auth.backToLogin") : t("auth.goToLogin")}
          </Button>
        </Link>
        <button
          type="button"
          onClick={vm.restart}
          className="h-11 w-full rounded-xl text-[13px] font-medium transition-colors"
          style={{ color: "var(--sx-text-mute)" }}
        >
          {t("auth.tryAnotherEmail")}
        </button>
      </div>
    </div>
  );
}
