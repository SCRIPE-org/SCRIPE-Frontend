/**
 * SetupAccountView — Public Enterprise Account Activation Portal
 *
 * 4-Stage Onboarding Stepper:
 *   Stage 1: Security (Password & Confirm Password, live policy meter & checklist)
 *   Stage 2: Profile (First Name, Last Name, Phone, Avatar dropzone, verified email/username)
 *   Stage 3: Attributes & Compliance (Dynamic custom fields with encryption badges)
 *   Stage 4: Launch Celebration (Workspace activation summary & direct access CTA)
 *
 * @module auth/account-setup
 */
"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { PhoneInput } from "@core/ui/phone-input";
import {
  XCircle,
  Building2,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAccountSetupViewModel } from "../viewmodels/useAccountSetupViewModel";
import { formatDateTimeUtc } from "@core/common/utils";
import {
  SetupLoadingView,
  SetupInvalidView,
  SetupErrorView,
  PasswordCheck,
} from "../components/SetupAccountStateViews";
import {
  PageWrapper,
  PasswordField,
  PasswordStrengthMeter,
  StepProgressIndicator,
  AvatarUploader,
  DynamicCustomField,
  LaunchCelebrationCard,
  InfoRow,
} from "../components/SetupAccountControls";

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

  // ── Lifecycle State Routing ──
  if (vm.pageState === "loading") {
    return (
      <PageWrapper>
        <SetupLoadingView />
      </PageWrapper>
    );
  }

  if (vm.pageState === "invalid") {
    return (
      <PageWrapper>
        <SetupInvalidView errorMessage={vm.errorMessage} />
      </PageWrapper>
    );
  }

  if (vm.pageState === "error") {
    return (
      <PageWrapper>
        <SetupErrorView errorMessage={vm.errorMessage} onRetry={vm.retry} />
      </PageWrapper>
    );
  }

  // ── Stage 4: Launch Celebration Screen ──
  if (vm.pageState === "success" || vm.currentStep === 4) {
    const adminFullName = [vm.firstName, vm.lastName].filter(Boolean).join(" ");
    return (
      <PageWrapper>
        <LaunchCelebrationCard
          tenantName={vm.tokenData?.tenantName}
          tenantCode={vm.tokenData?.tenantCode}
          adminUsername={vm.tokenData?.adminUsername}
          adminName={adminFullName || vm.tokenData?.adminUsername || ""}
          adminEmail={vm.tokenData?.adminEmail}
          profileImageUrl={vm.profileImageUrl}
        />
      </PageWrapper>
    );
  }

  // ── Main Stepper Card (Valid Token) ──
  const hasCustomFields = vm.customFields.length > 0;
  const adminNameInitials = [vm.firstName, vm.lastName].filter(Boolean).join(" ");

  return (
    <PageWrapper>
      <Card className="w-full max-w-xl border border-border bg-card shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4 pb-4">
          <StepProgressIndicator
            currentStep={vm.currentStep}
            hasCustomFields={hasCustomFields}
            onStepClick={vm.goToStep}
          />

          <div className="text-center space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">
              {vm.currentStep === 1 && t("auth.accountSetup.step1Security")}
              {vm.currentStep === 2 && t("auth.accountSetup.step2Profile")}
              {vm.currentStep === 3 && t("auth.accountSetup.step3Attributes")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {vm.currentStep === 1 && t("auth.accountSetup.step1Desc")}
              {vm.currentStep === 2 && t("auth.accountSetup.step2Desc")}
              {vm.currentStep === 3 && t("auth.accountSetup.step3Desc")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 1: SECURITY CREDENTIALS                                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {vm.currentStep === 1 && (
            <div className="space-y-5 min-w-0">
              {/* Account Meta Box */}
              <div className="space-y-2 rounded-xl border border-border/50 bg-muted/25 p-3.5 min-w-0">
                <InfoRow
                  icon={<Building2 className="h-4 w-4 text-primary shrink-0" />}
                  label={t("auth.accountSetup.organization")}
                  value={vm.tokenData?.tenantName}
                />
                <InfoRow
                  icon={<User className="h-4 w-4 text-muted-foreground shrink-0" />}
                  label={t("auth.accountSetup.username")}
                  value={vm.tokenData?.adminUsername}
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4 text-muted-foreground shrink-0" />}
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
              {vm.password.length > 0 && <PasswordStrengthMeter score={vm.passwordScore} />}

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
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 2: PROFILE DETAILS & AVATAR                              */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {vm.currentStep === 2 && (
            <div className="space-y-5">
              {/* Avatar Uploader Dropzone */}
              <AvatarUploader
                profileImageUrl={vm.profileImageUrl}
                name={adminNameInitials}
                onUpload={vm.handleAvatarUpload}
                onRemove={vm.removeAvatar}
                error={vm.avatarError}
              />

              {/* Name Fields: First Name & Last Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-first-name" className="text-xs font-medium">
                    {t("auth.accountSetup.firstName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="admin-first-name"
                    value={vm.firstName}
                    onChange={(e) => vm.setFirstName(e.target.value)}
                    placeholder={t("auth.accountSetup.firstNamePlaceholder")}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-last-name" className="text-xs font-medium">
                    {t("auth.accountSetup.lastName")}
                  </Label>
                  <Input
                    id="admin-last-name"
                    value={vm.lastName}
                    onChange={(e) => vm.setLastName(e.target.value)}
                    placeholder={t("auth.accountSetup.lastNamePlaceholder")}
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="admin-phone" className="text-xs font-medium">
                  {t("auth.accountSetup.phoneNumber")}
                </Label>
                <PhoneInput
                  value={vm.phoneNumber}
                  onChange={vm.setPhoneNumber}
                  defaultCountry="SA"
                />
              </div>

              {/* Account Identity Credentials (Verified / Locked) */}
              <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs min-w-0">
                <div className="space-y-1 min-w-0">
                  <span className="text-muted-foreground">{t("auth.accountSetup.emailAddress")}</span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate min-w-0">{vm.tokenData?.adminEmail}</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                      {t("auth.accountSetup.verified")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <span className="text-muted-foreground">{t("auth.accountSetup.username")}</span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground min-w-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono truncate min-w-0">@{vm.tokenData?.adminUsername}</span>
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-1.5"
                  onClick={vm.goToPrevStep}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("auth.accountSetup.back")}</span>
                </Button>

                <Button
                  type="button"
                  size="lg"
                  className="flex-1 gap-1.5 font-semibold"
                  disabled={!vm.isProfileValid}
                  loading={vm.pageState === "activating"}
                  onClick={vm.goToNextStep}
                >
                  <span>
                    {hasCustomFields
                      ? t("auth.accountSetup.next")
                      : t("auth.accountSetup.completeSetup")}
                  </span>
                  {hasCustomFields ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 3: ATTRIBUTES & COMPLIANCE                                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {vm.currentStep === 3 && (
            <div className="space-y-5 min-w-0">
              {/* Compliance Info Banner */}
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
                <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  Additional organizational and compliance attributes required for your administrator profile. Sensitive fields are end-to-end encrypted.
                </p>
              </div>

              {/* Dynamic Custom Fields Grid */}
              {vm.isLoadingCustomFields ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading attributes...
                </div>
              ) : hasCustomFields ? (
                <div className="grid gap-4 sm:grid-cols-2 min-w-0">
                  {vm.customFields.map((field) => (
                    <DynamicCustomField
                      key={field.key}
                      field={field}
                      value={vm.customFieldValues[field.key]}
                      onChange={(val) => vm.setCustomFieldValue(field.key, val)}
                      invalid={vm.attributesTouched && Boolean(vm.customFieldErrors[field.key])}
                      error={vm.attributesTouched ? vm.customFieldErrors[field.key] : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-border/50 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
                  {t("auth.accountSetup.noAttributesNeeded")}
                </div>
              )}

              {/* Step 3 Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-1.5"
                  onClick={vm.goToPrevStep}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("auth.accountSetup.back")}</span>
                </Button>

                <Button
                  type="button"
                  size="lg"
                  className="flex-1 gap-1.5 font-semibold shadow-xs"
                  disabled={!vm.isAttributesValid}
                  loading={vm.pageState === "activating"}
                  onClick={vm.activate}
                >
                  <span>{t("auth.accountSetup.completeSetup")}</span>
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Expiration Note */}
          {vm.tokenData?.expiresAt && (
            <p className="text-center text-[11px] text-muted-foreground/70">
              {t("auth.accountSetup.expiresOn")} {formatDateTimeUtc(vm.tokenData.expiresAt)}
            </p>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
