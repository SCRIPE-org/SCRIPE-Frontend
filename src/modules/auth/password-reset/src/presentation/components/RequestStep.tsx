"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { KeyRound } from "lucide-react";
import { StepDots } from "./StepDots";
import type { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

interface RequestStepProps {
  vm: ReturnType<typeof useForgotPasswordViewModel>;
  totalSteps: number;
}

export function RequestStep({ vm, totalSteps }: RequestStepProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      {/* Icon + heading */}
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "var(--sx-accent-soft)",
            border: "1px solid var(--sx-accent-soft-border)",
          }}
        >
          <KeyRound
            className="h-6 w-6"
            style={{ color: "var(--sx-accent-text)" }}
            aria-hidden="true"
          />
        </div>
        <h1
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text)" }}
        >
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p
          className="mt-1.5 text-[13px] leading-relaxed"
          style={{ color: "var(--sx-text-mute)" }}
        >
          {t("auth.forgotPasswordSubtitle")}
        </p>
      </div>

      {/* Step dots */}
      <StepDots current={1} total={totalSteps} />

      <form onSubmit={vm.submitEmail} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="fp-email"
            className="block text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.email")}
          </Label>
          <Input
            id="fp-email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={vm.email}
            onChange={(e) => vm.setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
            className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
          />
        </div>

        <Button
          type="submit"
          disabled={!vm.canSubmitEmail}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          {t("auth.sendResetLink")}
        </Button>
      </form>
    </div>
  );
}
