"use client";

import type { PasswordPolicyModel } from "@core/common/password-policy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Lock } from "lucide-react";
import type { ChangePasswordRequest } from "../../../domain/interfaces/IProfileRepository";
import { PasswordChangeForm } from "../../components/PasswordChangeForm";
import { PasswordExpiryBanner } from "../../components/PasswordExpiryBanner";

/** Props for {@link PasswordRotationSection}. */
export interface PasswordRotationSectionProps {
  t: (key: string) => string;
  isPasswordExpired: boolean;
  daysUntilPasswordExpiry: number | null;
  passwordLastChanged: Date | null;
  policy: PasswordPolicyModel | null | undefined;
  policyLoading?: boolean;
  policyError?: string | null;
  onRetryPolicy?: () => void;
  isTwoFactorEnabled: boolean;
  onSubmit: (data: ChangePasswordRequest) => Promise<unknown>;
  isSubmitting: boolean;
  submitError: string | null;
  success: boolean;
}

/**
 * Security vault section rendering password expiry telemetry alongside policy-driven
 * password rotation with optional two-factor authentication verification.
 */
export function PasswordRotationSection({
  t,
  isPasswordExpired,
  daysUntilPasswordExpiry,
  passwordLastChanged,
  policy,
  policyLoading,
  policyError,
  onRetryPolicy,
  isTwoFactorEnabled,
  onSubmit,
  isSubmitting,
  submitError,
  success,
}: PasswordRotationSectionProps) {
  return (
    <>
      <PasswordExpiryBanner
        isExpired={isPasswordExpired}
        daysRemaining={daysUntilPasswordExpiry}
        passwordLastChanged={passwordLastChanged}
      />
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">
              {t("profile.security.changePassword")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.security.passwordRequirements")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm
            policy={policy}
            policyLoading={policyLoading}
            policyError={policyError}
            onRetryPolicy={onRetryPolicy}
            isTwoFactorEnabled={isTwoFactorEnabled}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
            success={success}
          />
        </CardContent>
      </Card>
    </>
  );
}
