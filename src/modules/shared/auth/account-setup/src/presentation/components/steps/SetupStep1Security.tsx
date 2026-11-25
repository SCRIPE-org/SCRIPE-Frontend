"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { ArrowRight, Building2, Check, Mail, User, XCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { DEFAULT_PASSWORD_MAX_LENGTH } from "@core/common/password-policy";
import { InfoRow } from "../InfoRow";
import { PasswordWithPolicyField } from "@core/ui/password-policy-field";
import { PasswordInput } from "@core/ui/password-input";
import type { useAccountSetupViewModel } from "../../viewmodels/useAccountSetupViewModel";

/**
 * Documentation for module export
 */
export interface SetupStep1SecurityProps {
  vm: ReturnType<typeof useAccountSetupViewModel>;
}

/**
 * Step 1: Security Credentials and Password Setup.
 */
export function SetupStep1Security({ vm }: SetupStep1SecurityProps) {
  const { t } = useI18n();

  return (
    <div className="min-w-0 space-y-5">
      {/* Account Meta Box */}
      <div className="min-w-0 space-y-2 rounded-xl border border-nx-line bg-nx-raised p-3.5">
        <InfoRow
          icon={<Building2 className="h-4 w-4 shrink-0 text-nx-accent" />}
          label={t("auth.accountSetup.organization")}
          value={vm.tokenData?.tenantName}
        />
        <InfoRow
          icon={<User className="h-4 w-4 shrink-0 text-nx-ink-2" />}
          label={t("auth.accountSetup.username")}
          value={vm.tokenData?.adminUsername}
        />
        <InfoRow
          icon={<Mail className="h-4 w-4 shrink-0 text-nx-ink-2" />}
          label={t("auth.accountSetup.emailAddress")}
          value={vm.tokenData?.adminEmail}
        />
      </div>

      {/* Policy-Driven Password Field + Live Checklist */}
      <PasswordWithPolicyField
        id="setup-password"
        label={t("auth.password")}
        value={vm.password}
        onValueChange={vm.setPassword}
        policy={vm.passwordPolicy}
        policyLoading={vm.isPasswordPolicyLoading}
        policyError={vm.passwordPolicyError}
        onRetryPolicy={vm.retryPasswordPolicy}
        placeholder={t("auth.accountSetup.passwordPlaceholder")}
        surface="nexus"
        alwaysShowChecklist={vm.password.length > 0 || vm.isPasswordPolicyLoading || Boolean(vm.passwordPolicyError)}
        t={t}
        autoFocus
        required
      />

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="setup-confirm">{t("auth.confirmPassword")}</Label>
        <PasswordInput
          id="setup-confirm"
          value={vm.confirmPassword}
          onChange={(e) => vm.setConfirmPassword(e.target.value)}
          placeholder={t("auth.confirmPasswordPlaceholder")}
          autoComplete="new-password"
          maxLength={vm.passwordPolicy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH}
        />
        {vm.confirmPassword.length > 0 && (
          <div className="flex min-w-0 items-center gap-1.5">
            {vm.passwordChecks.matches ? (
              <Check
                className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-nx-success"
                aria-hidden="true"
              />
            ) : (
              <div
                className="mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-nx-line-hi"
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "truncate text-xs transition-colors",
                vm.passwordChecks.matches ? "font-medium text-nx-ink" : "text-nx-ink-2"
              )}
            >
              {t("auth.accountSetup.passwordsMatch")}
            </span>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {vm.validationErrors.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          {vm.validationErrors.map((err, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-nx-danger">
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Step 1 Action */}
      <Button
        className="w-full gap-2 font-semibold"
        size="lg"
        disabled={!vm.isPasswordValid}
        onClick={vm.goToNextStep}
      >
        <span>{t("auth.accountSetup.next")}</span>
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}
