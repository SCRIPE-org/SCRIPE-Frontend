/**
 * SetupAccountView — Public Account Activation Page (thin orchestrator)
 *
 * Token-based password setup for new tenant admins.
 * Flow: Validate token → Show form → Set password → Redirect to login
 *
 * State sub-views extracted to SetupAccountStateViews.
 * @module auth/account-setup
 */
"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Shield, XCircle, KeyRound, Building2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAccountSetupViewModel } from "../viewmodels/useAccountSetupViewModel";
import { formatDateTimeUtc } from "@core/common/utils";
import {
  SetupLoadingView,
  SetupInvalidView,
  SetupSuccessView,
  SetupErrorView,
  PasswordCheck,
} from "../components/SetupAccountStateViews";
import {
  PageWrapper,
  PasswordField,
  InfoRow,
} from "../components/SetupAccountControls";

/**
 * SetupAccountView is the main public page component for the workspace administrator setup flow.
 * Orchestrates the validation of initialization tokens from query string parameters,
 * routes the visual rendering state based on the validation outcome (loading, invalid, success, error),
 * and renders the secure credentials setup form where tenant administrators establish their initial passcodes.
 */
export function SetupAccountView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const vm = useAccountSetupViewModel({
    token,
    missingTokenMessage: t("auth.accountSetup.missingToken"),
    invalidTokenMessage: t("auth.accountSetup.invalidToken"),
    validationFailedMessage: t("auth.accountSetup.validationFailed"),
    activationFailedMessage: t("auth.accountSetup.activationFailed"),
    activationUnexpectedMessage: t("auth.accountSetup.activationUnexpected"),
    passwordValidationMessages: {
      minLength: t("auth.accountSetup.passwordMinLength"),
      hasUpper: t("auth.accountSetup.passwordUpper"),
      hasLower: t("auth.accountSetup.passwordLower"),
      hasNumber: t("auth.accountSetup.passwordNumber"),
      hasSpecial: t("auth.accountSetup.passwordSpecial"),
      matches: t("auth.accountSetup.passwordsMatch"),
    },
  });

  // ── State routing ─────────────────────────────────────────────────────────
  if (vm.pageState === "loading")
    return (
      <PageWrapper>
        <SetupLoadingView />
      </PageWrapper>
    );
  if (vm.pageState === "invalid")
    return (
      <PageWrapper>
        <SetupInvalidView errorMessage={vm.errorMessage} />
      </PageWrapper>
    );
  if (vm.pageState === "success")
    return (
      <PageWrapper>
        <SetupSuccessView tokenData={vm.tokenData} />
      </PageWrapper>
    );
  if (vm.pageState === "error")
    return (
      <PageWrapper>
        <SetupErrorView errorMessage={vm.errorMessage} onRetry={() => vm.setPageState("valid")} />
      </PageWrapper>
    );

  // ── Main form (valid token) ───────────────────────────────────────────────
  return (
    <PageWrapper>
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto mb-3 rounded-full bg-primary/10 p-3">
            <KeyRound className="h-7 w-7 text-nx-accent" />
          </div>
          <CardTitle className="text-xl">{t("auth.accountSetup.setPasswordTitle")}</CardTitle>
          <CardDescription>
            {t("auth.accountSetup.completeFor")}{" "}
            <span className="font-medium text-foreground">{vm.tokenData?.tenantName}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Account info */}
          <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/30 p-3">
            <InfoRow
              icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              label={t("auth.accountSetup.organization")}
              value={vm.tokenData?.tenantName}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
              label={t("auth.accountSetup.username")}
              value={vm.tokenData?.adminUsername}
            />
          </div>

          {/* Password field */}
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

          {/* Strength indicators */}
          {vm.password.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5 text-xs">
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

          {/* Confirm field */}
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

          {/* Validation errors */}
          {vm.validationErrors.length > 0 && (
            <div className="space-y-1 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              {vm.validationErrors.map((err, i) => (
                <p key={i} className="flex items-center gap-1.5 text-xs text-destructive">
                  <XCircle className="h-3 w-3 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!vm.isPasswordValid}
            loading={vm.pageState === "activating"}
            onClick={vm.activate}
          >
            {vm.pageState !== "activating" && <Shield className="me-2 h-4 w-4" />}
            {vm.pageState === "activating"
              ? t("auth.accountSetup.activating")
              : t("auth.accountSetup.activate")}
          </Button>

          {vm.tokenData?.expiresAt && (
            <p className="text-center text-xs text-muted-foreground">
              {t("auth.accountSetup.expiresOn")} {formatDateTimeUtc(vm.tokenData.expiresAt)}
            </p>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

