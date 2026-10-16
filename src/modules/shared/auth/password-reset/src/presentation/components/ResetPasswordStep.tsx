/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { PasswordInput } from "@core/ui/password-input";
import { Lock } from "lucide-react";
import type { useResetPasswordViewModel } from "../viewmodels/useResetPasswordViewModel";

/**
 * ResetPasswordStep Component
 *
 * Renders the new password form where the user enters and confirms their new password.
 * Performs real-time complexity and matching checks.
 *
 * Props:
 *   - vm: The ResetPasswordViewModel instance managing the reset flow state.
 *   - headline: Header text for the step.
 */

interface ResetPasswordStepProps {
  vm: ReturnType<typeof useResetPasswordViewModel>;
  headline: string;
}

/**
 * Renders password and confirm-password fields with matching validation and submit button.
 */
export function ResetPasswordStep({ vm, headline }: ResetPasswordStepProps) {
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
          <Lock className="h-6 w-6" style={{ color: "var(--sx-accent-text)" }} aria-hidden="true" />
        </div>
        <h1
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text)" }}
        >
          {headline}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.resetPasswordDesc")}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={vm.submit} className="flex flex-col gap-4">
        {/* New password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="block text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.newPassword")}
          </Label>
          <PasswordInput
            id="password"
            value={vm.password}
            onChange={(e) => vm.setPassword(e.target.value)}
            placeholder={t("auth.newPasswordPlaceholder")}
            required
            autoFocus
            minLength={8}
            className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
          />
          <p className="text-[12px]" style={{ color: "var(--sx-text-faint)" }}>
            {t("auth.passwordMinLength")}
          </p>
        </div>

        {/* Confirm password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="block text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--sx-text-mute)" }}
          >
            {t("auth.confirmPassword")}
          </Label>
          <PasswordInput
            id="confirmPassword"
            value={vm.confirmPassword}
            onChange={(e) => vm.setConfirmPassword(e.target.value)}
            placeholder={t("auth.confirmPasswordPlaceholder")}
            required
            minLength={8}
            className="h-12 w-full rounded-xl border px-4 text-[15px] shadow-none transition-all focus-visible:ring-0"
          />
          {vm.confirmPassword && vm.password !== vm.confirmPassword && (
            <p className="text-[12px] text-destructive">{t("auth.passwordMismatch")}</p>
          )}
        </div>

        {/* API error */}
        {vm.error && (
          <div
            className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-[13px] font-medium text-destructive">
              {vm.error.startsWith("auth.") ? t(vm.error as any) : vm.error}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!vm.isValid}
          loading={vm.isSubmitting}
          className="mt-1 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-semibold text-white transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          {t("auth.resetPasswordAction")}
        </Button>
      </form>
    </div>
  );
}
