"use client";

/**
 * ProfileSecurityView
 *
 * Security & Identity Vault view.
 * Integrates FIDO2/WebAuthn Level 3 Passkeys, Two-Factor Authentication (TOTP),
 * Password Rotation, Biometric Sudo Mode step-up, and Emergency Account Lockdown.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useSecurityVaultViewModel } from "../viewmodels/useSecurityVaultViewModel";
import { EnrollPasskeyModal } from "../components/EnrollPasskeyModal";
import { TwoFactorWizardModal } from "../components/TwoFactorWizardModal";
import { BiometricSudoModal } from "../components/BiometricSudoModal";
import { EmergencyLockdownDialog } from "../components/EmergencyLockdownDialog";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Plus,
  Trash2,
  Clock,
  Laptop,
  Smartphone,
  Key,
  Lock,
  Loader2,
  CheckCircle2,
  ShieldX,
} from "lucide-react";

/**
 * ProfileSecurityView Component
 *
 * Renders the Security & Passkey Vault view for user credentials,
 * passkeys, two-factor authentication, biometric sudo mode, and emergency lockdown.
 */
export function ProfileSecurityView() {
  const { t } = useI18n();
  const {
    passkeys,
    isLoadingPasskeys,
    detectDeviceBadge,
    enrollPasskey,
    isEnrollingPasskey,
    enrollError,
    removePasskey,
    isRemovingPasskey,
    webAuthnSupported,
    isTwoFactorEnabled,
    backupCodesRemaining,
    twoFaSetupData,
    clearTwoFaSetup,
    begin2FaSetup,
    isBeginning2Fa,
    confirm2Fa,
    isConfirming2Fa,
    disable2Fa,
    isDisabling2Fa,
    regenerateBackupCodes,
    isRegeneratingCodes,
    changePassword,
    isChangingPassword,
    changePasswordError,
    isSudoActive,
    sudoExpiresAt,
    verifySudo,
    isVerifyingSudo,
    sudoError,
    emergencyLockdown,
    isLockingDown,
  } = useSecurityVaultViewModel();

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isSudoModalOpen, setIsSudoModalOpen] = useState(false);
  const [isLockdownOpen, setIsLockdownOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordSubmit = async (data: any) => {
    setPasswordSuccess(false);
    await changePassword(data);
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const getBadgeIcon = (iconType: string) => {
    switch (iconType) {
      case "apple":
      case "windows":
        return Laptop;
      case "smartphone":
        return Smartphone;
      default:
        return Key;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.security.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">
          {t("profile.security.description")}
        </p>
      </div>

      {/* ── 1. Passkey & FIDO2 Cryptographic Vault ──────────────── */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.passkeys.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.passkeys.sectionDesc")}
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={() => setIsEnrollModalOpen(true)}
            className="text-xs font-semibold gap-1.5"
            disabled={!webAuthnSupported}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("profile.passkeys.addPasskeyBtn")}</span>
          </Button>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoadingPasskeys ? (
            <div className="p-4 rounded-xl border border-nx-line bg-nx-raised animate-pulse text-xs text-nx-ink-3">
              {t("profile.common.loading")}
            </div>
          ) : passkeys.length === 0 ? (
            <div className="p-6 rounded-xl border border-nx-line bg-nx-raised text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-nx-accent-wash text-nx-accent flex items-center justify-center mx-auto">
                <Fingerprint className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
              </div>
              <p className="text-xs font-semibold text-nx-ink">
                {t("profile.passkeys.noPasskeysTitle")}
              </p>
              <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">
                {t("profile.passkeys.noPasskeysDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {passkeys.map((pk) => {
                const badge = detectDeviceBadge(pk.aaguid || undefined);
                const BadgeIcon = getBadgeIcon(badge.icon);

                return (
                  <div
                    key={pk.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-line-hi transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-nx-surface border border-nx-line text-nx-ink shrink-0">
                        <BadgeIcon className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-nx-ink truncate">
                            {pk.deviceName}
                          </span>
                          <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] py-0 px-1.5">
                            {pk.modelName || badge.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-nx-ink-3 font-mono">
                          <span>{pk.credentialIdMasked}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pk.lastUsedAt
                              ? `${t("profile.passkeys.lastUsed")}: ${pk.lastUsedAt.toLocaleDateString()}`
                              : t("profile.passkeys.neverUsed")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePasskey(pk.id)}
                      disabled={isRemovingPasskey}
                      className="h-8 w-8 p-0 text-nx-ink-3 hover:text-destructive hover:bg-destructive/10"
                      aria-label={t("profile.passkeys.removePasskeyAria")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 2. Biometric Sudo Mode Step-Up ──────────────────────── */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.sudo.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.sudo.sectionDesc")}
            </CardDescription>
          </div>

          {isSudoActive ? (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs py-1 px-2.5 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.sudo.activeSession")}</span>
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSudoModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              <span>{t("profile.sudo.stepUpBtn")}</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="p-3.5 rounded-xl border border-nx-line bg-nx-raised text-xs text-nx-ink-2 flex items-center justify-between">
            <p>{t("profile.sudo.infoNotice")}</p>
            {isSudoActive && sudoExpiresAt && (
              <span className="font-mono text-[10px] text-nx-ink shrink-0 ms-2">
                {t("profile.sudo.expires", { time: sudoExpiresAt.toLocaleTimeString() })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Two-Factor Authentication (TOTP) ─────────────────── */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">
                {t("profile.security.twoFactor.title")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {isTwoFactorEnabled
                ? t("profile.security.twoFactor.enabled")
                : t("profile.security.twoFactor.disabled")}
            </CardDescription>
          </div>

          {isTwoFactorEnabled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disable2Fa({ password: "", code: "" })}
              disabled={isDisabling2Fa}
              className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {isDisabling2Fa && <Loader2 className="h-3.5 w-3.5 animate-spin me-1.5" />}
              {t("profile.security.twoFactor.disableBtn")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => begin2FaSetup()}
              disabled={isBeginning2Fa}
              className="text-xs font-semibold"
            >
              {isBeginning2Fa && <Loader2 className="h-3.5 w-3.5 animate-spin me-1.5" />}
              {t("profile.security.twoFactor.enableBtn")}
            </Button>
          )}
        </CardHeader>

        {isTwoFactorEnabled && (
          <CardContent className="pt-2 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-raised text-xs">
              <div>
                <span className="font-semibold text-nx-ink">
                  {t("profile.security.twoFactor.backupCodes")}:
                </span>{" "}
                <span className="font-mono font-bold text-nx-accent">
                  {backupCodesRemaining ?? t("profile.security.twoFactor.available")}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => regenerateBackupCodes("")}
                disabled={isRegeneratingCodes}
                className="text-xs h-8"
              >
                {t("profile.security.twoFactor.regenerate")}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ── 4. Password Rotation ─────────────────────────────────── */}
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
            isTwoFactorEnabled={isTwoFactorEnabled}
            onSubmit={handlePasswordSubmit}
            isSubmitting={isChangingPassword}
            submitError={changePasswordError}
            success={passwordSuccess}
          />
        </CardContent>
      </Card>

      {/* ── 5. Emergency Account Shield (Nuclear Lockdown) ────────── */}
      <Card className="border border-destructive/40 bg-destructive/5 hover:border-destructive/60 transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold">
                {t("profile.lockdown.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-destructive/80 mt-1">
              {t("profile.lockdown.sectionDesc")}
            </CardDescription>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsLockdownOpen(true)}
            className="text-xs font-semibold gap-1.5"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{t("profile.lockdown.triggerBtn")}</span>
          </Button>
        </CardHeader>
      </Card>

      {/* Modals & Dialogs */}
      <EnrollPasskeyModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onEnroll={enrollPasskey}
        isEnrolling={isEnrollingPasskey}
        enrollError={enrollError}
      />

      <TwoFactorWizardModal
        isOpen={!!twoFaSetupData}
        onClose={clearTwoFaSetup}
        setupData={twoFaSetupData}
        onConfirm={confirm2Fa}
        isConfirming={isConfirming2Fa}
      />

      <BiometricSudoModal
        isOpen={isSudoModalOpen}
        onClose={() => setIsSudoModalOpen(false)}
        onVerify={async () => {
          await verifySudo();
          setIsSudoModalOpen(false);
        }}
        isVerifying={isVerifyingSudo}
        error={sudoError}
      />

      <EmergencyLockdownDialog
        isOpen={isLockdownOpen}
        onClose={() => setIsLockdownOpen(false)}
        onConfirmLockdown={emergencyLockdown}
        isLockingDown={isLockingDown}
      />
    </div>
  );
}
