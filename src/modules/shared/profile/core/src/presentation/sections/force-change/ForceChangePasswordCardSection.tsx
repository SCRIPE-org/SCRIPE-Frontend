"use client";

import React from "react";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  type PasswordPolicyModel,
} from "@core/common/password-policy";
import { PasswordInput } from "@core/ui/password-input";
import { PasswordWithPolicyField } from "@core/ui/password-policy-field";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
import { ShieldAlert, LogOut, AlertCircle, LockKeyhole, UserCheck } from "lucide-react";

/**
 * Props for ForceChangePasswordCardSection.
 */
export interface ForceChangePasswordCardSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  username: string | null | undefined;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  policy: PasswordPolicyModel | null | undefined;
  isPolicyLoading: boolean;
  policyError: string | null;
  onRetryPolicy: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  showMismatch: boolean;
  canSubmit: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onLogout: () => void;
}

/**
 * Focused password rotation card displaying the backend policy-driven strength checklist,
 * confirm input, error alert, and alternate account sign-out trigger.
 */
export function ForceChangePasswordCardSection({
  t,
  username,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  policy,
  isPolicyLoading,
  policyError,
  onRetryPolicy,
  isSubmitting,
  submitError,
  showMismatch,
  canSubmit,
  onSubmit,
  onLogout,
}: ForceChangePasswordCardSectionProps) {
  return (
    <Card className="border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi transition-colors">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-warning/40 bg-warning/10 text-warning gap-1.5 px-2.5 py-1 text-[11px] font-medium"
          >
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t("profile.security.firstLoginBadge")}</span>
          </Badge>

          {username && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-nx-line bg-nx-raised px-2.5 py-1 text-xs font-mono text-nx-ink-2 max-w-[180px] truncate">
              <UserCheck className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
              <span className="truncate">{username}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <CardTitle className="text-xl font-bold tracking-tight text-nx-ink flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-nx-accent shrink-0" aria-hidden="true" />
            <span>{t("profile.security.updatePassword")}</span>
          </CardTitle>
          <CardDescription className="text-sm text-nx-ink-2 leading-relaxed">
            {t("profile.security.forceChangeDescription")}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {submitError && (
          <div
            role="alert"
            data-testid="force-change-error"
            className="rounded-nx-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <PasswordWithPolicyField
            id="force-new-password"
            data-testid="force-new-password"
            label={t("profile.security.newPassword")}
            value={newPassword}
            onValueChange={onNewPasswordChange}
            policy={policy}
            policyLoading={isPolicyLoading}
            policyError={policyError}
            onRetryPolicy={onRetryPolicy}
            disabled={isSubmitting}
            autoComplete="new-password"
            surface="nexus"
            t={t}
            required
          />

          <div className="space-y-1.5">
            <Label htmlFor="force-confirm-password" className="text-xs font-semibold text-nx-ink">
              {t("profile.security.confirmPassword")}
            </Label>
            <PasswordInput
              id="force-confirm-password"
              data-testid="force-confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={isSubmitting}
              maxLength={policy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH}
              aria-invalid={showMismatch}
              className={cn(
                "bg-nx-raised border-nx-line text-nx-ink",
                showMismatch && "border-destructive focus-visible:ring-destructive/40"
              )}
              required
            />
            {showMismatch && (
              <output className="block text-xs text-destructive">
                {t("profile.security.passwordMismatch")}
              </output>
            )}
          </div>

          <div className="pt-2 space-y-2.5">
            <Button
              type="submit"
              data-testid="force-change-submit"
              disabled={!canSubmit}
              className="w-full bg-nx-accent-fill text-nx-on-fill font-semibold gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="inline" showText={false} />
                  <span>{t("profile.security.submittingPassword")}</span>
                </>
              ) : (
                <span>{t("profile.security.setNewPasswordCta")}</span>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="force-change-logout"
              onClick={onLogout}
              disabled={isSubmitting}
              className="w-full text-xs text-nx-ink-2 hover:text-nx-ink gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <span>{t("profile.security.wrongAccount")}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
