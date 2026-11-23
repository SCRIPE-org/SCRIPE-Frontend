"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import { PasswordWithPolicyField } from "@core/ui/password-policy-field";
import { DEFAULT_PASSWORD_MAX_LENGTH } from "@core/common/password-policy";
import { Lock } from "lucide-react";
import { StepDots } from "./StepDots";
import type { UsePasswordRecoveryViewModelReturn } from "../viewmodels/usePasswordRecoveryViewModel";

interface NewPasswordStepProps {
  vm: UsePasswordRecoveryViewModelReturn;
  totalSteps?: number;
  showStepDots?: boolean;
}

/**
 * Unified new-password creation step backed by `<PasswordWithPolicyField>` and
 * server-driven `PasswordPolicyModel` (never hardcoded length rules).
 */
export function NewPasswordStep({
  vm,
  totalSteps = 5,
  showStepDots = true,
}: NewPasswordStepProps) {
  const { t } = useI18n();

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

  const maxLength = vm.effectivePolicy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH;

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

      {showStepDots && <StepDots current={5} total={totalSteps} />}

      <form onSubmit={vm.submitNewPassword} className="flex flex-col gap-4">
        <PasswordWithPolicyField
          id="fp-new-password"
          label={t("auth.newPassword")}
          value={vm.newPassword}
          onValueChange={vm.setNewPassword}
          policy={vm.effectivePolicy}
          policyLoading={vm.isPolicyLoading}
          policyError={vm.policyError}
          onRetryPolicy={vm.retryPolicy}
          placeholder={t("auth.newPasswordPlaceholder")}
          autoFocus
          required
          autoComplete="new-password"
          surface="vault"
          showChecklist
          alwaysShowChecklist
          showStrengthBar
          t={t}
        />

        <div className="space-y-2">
          <Label htmlFor="fp-confirm-password" className="text-xs font-semibold text-nx-ink">
            {t("auth.confirmPassword")}
          </Label>
          <PasswordInput
            id="fp-confirm-password"
            value={vm.confirmPassword}
            onChange={(e) => vm.setConfirmPassword(e.target.value)}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            required
            maxLength={maxLength}
            autoComplete="new-password"
            className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
          />
          {vm.confirmPassword.length > 0 && (
            <p
              className="text-[12px]"
              style={{
                color: vm.passwordsMatch ? "hsl(var(--success))" : "hsl(var(--destructive))",
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
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-nx-on-fill transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          {t("auth.resetPasswordAction")}
        </Button>
      </form>
    </div>
  );
}
