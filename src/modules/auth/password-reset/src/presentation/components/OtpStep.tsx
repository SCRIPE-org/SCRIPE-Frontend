"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { StepDots } from "./StepDots";
import { OtpInputField } from "@core/ui/otp-input-field";
import type { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

interface OtpStepProps {
  vm: ReturnType<typeof useForgotPasswordViewModel>;
  totalSteps: number;
}

export function OtpStep({ vm, totalSteps }: OtpStepProps) {
  const { t } = useI18n();

  // Auto-submit when 6 digits are entered
  React.useEffect(() => {
    if (vm.otp.length === 6) {
      vm.submitOtp({ preventDefault: () => {} } as React.FormEvent);
    }
  }, [vm.otp, vm]);

  const resolveError = (err: string) => {
    if (!err) return "";
    if (err.startsWith("auth.")) {
      try {
        const translated = t(err as Parameters<typeof t>[0]);
        return translated ?? err;
      } catch {
        return err;
      }
    }
    return err;
  };

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
          <Mail
            className="h-6 w-6"
            style={{ color: "var(--sx-accent-text)" }}
            aria-hidden="true"
          />
        </div>
        <h1
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text)" }}
        >
          {t("auth.enterOtpTitle")}
        </h1>
        <p
          className="mt-1.5 text-[13px] leading-relaxed"
          style={{ color: "var(--sx-text-mute)" }}
        >
          {t("auth.enterOtpSubtitle").replace("{{email}}", "")}{" "}
          <strong style={{ color: "var(--sx-text)" }}>{vm.email}</strong>
        </p>
      </div>

      <StepDots current={3} total={totalSteps} />

      <form onSubmit={vm.submitOtp} className="flex flex-col gap-5">
        <OtpInputField
          value={vm.otp}
          onChange={vm.setOtp}
          variant="vault"
          id="reset-otp"
        />

        {vm.error && (
          <div
            className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-[13px] font-medium text-destructive">
              {resolveError(vm.error)}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!vm.canSubmitOtp || vm.isLoading}
          loading={vm.isLoading}
          className="flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          {t("auth.verifyCode")}
        </Button>
      </form>

      {/* Resend */}
      <div className="text-center">
        <button
          type="button"
          onClick={vm.resendCode}
          disabled={vm.cooldown > 0 || vm.isLoading}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium transition-all disabled:opacity-40"
          style={{ color: "var(--sx-text-mute)" }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {vm.cooldown > 0
            ? t("auth.resendCooldown").replace("{{seconds}}", String(vm.cooldown))
            : t("auth.resendCode")}
        </button>
      </div>
    </div>
  );
}
