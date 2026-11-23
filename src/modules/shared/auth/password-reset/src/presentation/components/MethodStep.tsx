"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { ShieldCheck, Smartphone, Inbox, ChevronRight } from "lucide-react";
import { StepDots } from "./StepDots";
import type { UsePasswordRecoveryViewModelReturn } from "../viewmodels/usePasswordRecoveryViewModel";

interface MethodStepProps {
  vm: UsePasswordRecoveryViewModelReturn;
  totalSteps: number;
}

/**
 * Presentation UI component rendering Step 2 (delivery channel choice: OTP vs Magic Link).
 * Surfaces HTTP 429 rate-limit and network failures cleanly when present.
 */
export function MethodStep({ vm, totalSteps }: MethodStepProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "var(--sx-accent-soft)",
            border: "1px solid var(--sx-accent-soft-border)",
          }}
        >
          <ShieldCheck
            className="h-6 w-6"
            style={{ color: "var(--sx-accent-text)" }}
            aria-hidden="true"
          />
        </div>
        <h1
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text)" }}
        >
          {t("auth.chooseMethodTitle")}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.chooseMethodSubtitle").replace("{{email}}", "")}{" "}
          <strong style={{ color: "var(--sx-text)" }}>{vm.email}</strong>
        </p>
      </div>

      <StepDots current={2} total={totalSteps} />

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => void vm.chooseMethod("otp")}
          disabled={vm.isLoading}
          className="group flex h-auto items-center justify-start gap-4 whitespace-normal rounded-2xl border p-4 text-start transition-all hover:scale-[1.02] hover:bg-transparent active:scale-[0.99] disabled:opacity-50"
          style={{
            background: "var(--sx-chip-bg)",
            borderColor: "var(--sx-chip-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-accent-text)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-accent-soft)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-chip-border)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-chip-bg)";
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "var(--sx-accent-soft)",
              border: "1px solid var(--sx-accent-soft-border)",
            }}
          >
            <Smartphone className="h-5 w-5" style={{ color: "var(--sx-accent-text)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold" style={{ color: "var(--sx-text)" }}>
              {t("auth.otpMethodLabel")}
            </p>
            <p className="text-[12px]" style={{ color: "var(--sx-text-mute)" }}>
              {t("auth.otpMethodDesc")}
            </p>
          </div>
          <ChevronRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
            style={{ color: "var(--sx-text-mute)" }}
          />
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => void vm.chooseMethod("magic-link")}
          disabled={vm.isLoading}
          className="group flex h-auto items-center justify-start gap-4 whitespace-normal rounded-2xl border p-4 text-start transition-all hover:scale-[1.02] hover:bg-transparent active:scale-[0.99] disabled:opacity-50"
          style={{
            background: "var(--sx-chip-bg)",
            borderColor: "var(--sx-chip-border)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-accent-text)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-accent-soft)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--sx-chip-border)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--sx-chip-bg)";
          }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "var(--sx-accent-soft)",
              border: "1px solid var(--sx-accent-soft-border)",
            }}
          >
            <Inbox className="h-5 w-5" style={{ color: "var(--sx-accent-text)" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold" style={{ color: "var(--sx-text)" }}>
              {t("auth.magicLinkMethodLabel")}
            </p>
            <p className="text-[12px]" style={{ color: "var(--sx-text-mute)" }}>
              {t("auth.magicLinkMethodDesc")}
            </p>
          </div>
          <ChevronRight
            className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
            style={{ color: "var(--sx-text-mute)" }}
          />
        </Button>
      </div>

      {vm.error && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {vm.isLoading && (
        <div className="flex justify-center">
          <span
            className="sx-spin1 inline-block h-5 w-5 rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--sx-accent-text)", borderTopColor: "transparent" }}
          />
        </div>
      )}
    </div>
  );
}
