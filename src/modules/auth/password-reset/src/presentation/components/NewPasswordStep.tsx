"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import { Lock } from "lucide-react";
import { StepDots } from "./StepDots";
import { StrengthBar } from "./StrengthBar";
import type { useForgotPasswordViewModel } from "../viewmodels/useForgotPasswordViewModel";

interface NewPasswordStepProps {
  vm: ReturnType<typeof useForgotPasswordViewModel>;
  totalSteps: number;
}

export function NewPasswordStep({ vm, totalSteps }: NewPasswordStepProps) {
  const { t } = useI18n();

  const strengthLabels = [
    t("auth.passwordStrengthWeak"),
    t("auth.passwordStrengthFair"),
    t("auth.passwordStrengthGood"),
    t("auth.passwordStrengthStrong"),
  ];

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
          <Lock className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
        </div>
        <h1
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text)" }}
        >
          {t("auth.resetPassword")}
        </h1>
        {vm.selectedWorkspaces.length > 0 && (
          <p
            className="mt-1.5 text-[13px] leading-relaxed"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {vm.selectedWorkspaces.length === 1
              ? t("auth.resetPasswordFor").replace(
                  "{{workspace}}",
                  vm.selectedWorkspaces[0].tenantName
                )
              : t("auth.resetPasswordForCount").replace(
                  "{{count}}",
                  String(vm.selectedWorkspaces.length)
                )}
          </p>
        )}
      </div>

      <StepDots current={5} total={totalSteps} />

      <form onSubmit={vm.submitNewPassword} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="fp-new-password"
            className="block text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.newPassword")}
          </Label>
          <PasswordInput
            id="fp-new-password"
            value={vm.newPassword}
            onChange={(e) => vm.setNewPassword(e.target.value)}
            placeholder={t("auth.newPasswordPlaceholder")}
            required
            autoFocus
            minLength={8}
            className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
          />
          {vm.newPassword.length > 0 && (
            <StrengthBar strength={vm.passwordStrength} labels={strengthLabels} />
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="fp-confirm-password"
            className="block text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.confirmPassword")}
          </Label>
          <PasswordInput
            id="fp-confirm-password"
            value={vm.confirmPassword}
            onChange={(e) => vm.setConfirmPassword(e.target.value)}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            required
            minLength={8}
            className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
          />
          {vm.confirmPassword.length > 0 && (
            <p
              className="text-[12px]"
              style={{
                color: vm.passwordsMatch ? "rgb(34,197,94)" : "hsl(var(--destructive))",
              }}
            >
              {vm.passwordsMatch ? t("auth.passwordsMatch") : t("auth.passwordsDoNotMatch")}
            </p>
          )}
        </div>

        {vm.error && (
          <div
            className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-[13px] font-medium text-destructive">{resolveError(vm.error)}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!vm.canSubmitNewPassword || vm.isLoading}
          loading={vm.isLoading}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          {t("auth.changePassword")}
        </Button>
      </form>
    </div>
  );
}
