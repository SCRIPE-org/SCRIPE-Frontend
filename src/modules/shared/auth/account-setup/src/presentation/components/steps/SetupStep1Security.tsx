"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { ArrowRight, Building2, Mail, User, XCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { InfoRow } from "../InfoRow";
import { PasswordField } from "../PasswordField";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";
import { PasswordCheck } from "../PasswordCheck";
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
      <div className="min-w-0 space-y-2 rounded-xl border border-border/50 bg-muted/25 p-3.5">
        <InfoRow
          icon={<Building2 className="h-4 w-4 shrink-0 text-primary" />}
          label={t("auth.accountSetup.organization")}
          value={vm.tokenData?.tenantName}
        />
        <InfoRow
          icon={<User className="h-4 w-4 shrink-0 text-muted-foreground" />}
          label={t("auth.accountSetup.username")}
          value={vm.tokenData?.adminUsername}
        />
        <InfoRow
          icon={<Mail className="h-4 w-4 shrink-0 text-muted-foreground" />}
          label={t("auth.accountSetup.emailAddress")}
          value={vm.tokenData?.adminEmail}
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="setup-password">{t("auth.password")}</Label>
        <PasswordField
          id="setup-password"
          value={vm.password}
          show={vm.showPassword}
          placeholder={t("auth.accountSetup.passwordPlaceholder")}
          onChange={vm.setPassword}
          onToggle={() => vm.setShowPassword(!vm.showPassword)}
          autoFocus
        />
      </div>

      {/* Live Strength Meter */}
      {vm.password.length > 0 && (
        <PasswordStrengthMeter score={vm.passwordScore} entropyBits={vm.passwordEntropy} />
      )}

      {/* Password Requirements Checklist */}
      {vm.password.length > 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/40 bg-muted/15 p-3 text-xs">
          <PasswordCheck
            label={t("auth.accountSetup.passwordMinLengthShort", {
              min: vm.tokenData?.passwordMinLength ?? 8,
            })}
            ok={vm.passwordChecks.minLength}
          />
          {vm.tokenData?.passwordRequireUppercase !== false && (
            <PasswordCheck
              label={t("auth.accountSetup.passwordUpperShort")}
              ok={vm.passwordChecks.hasUpper}
            />
          )}
          <PasswordCheck
            label={t("auth.accountSetup.passwordLowerShort")}
            ok={vm.passwordChecks.hasLower}
          />
          {vm.tokenData?.passwordRequireNumber !== false && (
            <PasswordCheck
              label={t("auth.accountSetup.passwordNumberShort")}
              ok={vm.passwordChecks.hasNumber}
            />
          )}
          {vm.tokenData?.passwordRequireSpecial === true && (
            <PasswordCheck
              label={t("auth.accountSetup.passwordSpecialShort")}
              ok={vm.passwordChecks.hasSpecial}
            />
          )}
        </div>
      )}

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="setup-confirm">{t("auth.confirmPassword")}</Label>
        <PasswordField
          id="setup-confirm"
          value={vm.confirmPassword}
          show={vm.showConfirm}
          placeholder={t("auth.confirmPasswordPlaceholder")}
          onChange={vm.setConfirmPassword}
          onToggle={() => vm.setShowConfirm(!vm.showConfirm)}
        />
        {vm.confirmPassword.length > 0 && (
          <PasswordCheck
            label={t("auth.accountSetup.passwordsMatch")}
            ok={vm.passwordChecks.matches}
          />
        )}
      </div>

      {/* Validation Errors */}
      {vm.validationErrors.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
          {vm.validationErrors.map((err, i) => (
            <p key={i} className="flex items-center gap-1.5 text-xs text-destructive">
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Step 1 Action */}
      <Button
        className="w-full gap-2 font-semibold shadow-sm"
        size="lg"
        disabled={!vm.isPasswordValid}
        onClick={vm.goToNextStep}
      >
        <span>{t("auth.accountSetup.next")}</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
