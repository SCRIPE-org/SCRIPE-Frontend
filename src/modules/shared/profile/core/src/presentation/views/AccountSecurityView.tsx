"use client";

/**
 * AccountSecurityView
 *
 * Page 2 (/account/security):
 * W3C WebAuthn L3 Passkey Vault, FIDO2 Hardware Attestation Registry,
 * 3-Step TOTP 2FA & Backup Codes, Biometric Sudo Mode (15-min TTL),
 * Trusted IP CIDR Allowlist Policy, Password Rotation, and Emergency Account Lockdown.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useSecurityVaultViewModel } from "../viewmodels/useSecurityVaultViewModel";
import { useAccountSecuritySliceViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { EnrollPasskeyModal } from "../components/EnrollPasskeyModal";
import { TwoFactorStatus } from "../components/TwoFactorStatus";
import { TwoFactorWizardModal } from "../components/TwoFactorWizardModal";
import { BiometricSudoModal } from "../components/BiometricSudoModal";
import { EmergencyLockdownDialog } from "../components/EmergencyLockdownDialog";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { SecurityAdvancedShieldSection } from "../components/SecurityAdvancedShieldSection";
import { ConnectedEnterpriseSsoCard } from "../components/ConnectedEnterpriseSsoCard";
import {
  KeyRound, Fingerprint, Plus, Trash2, Clock, Lock, CheckCircle2,
} from "lucide-react";

export function AccountSecurityView() {
  const { t } = useI18n();
  const {
    passkeys, isLoadingPasskeys, detectDeviceBadge, enrollPasskey, isEnrollingPasskey,
    enrollError, removePasskey, isRemovingPasskey, webAuthnSupported, isTwoFactorEnabled,
    backupCodesRemaining, twoFaSetupData, clearTwoFaSetup, begin2FaSetup, isBeginning2Fa,
    confirm2Fa, isConfirming2Fa, disable2Fa, regenerateBackupCodes, changePassword,
    isChangingPassword, changePasswordError, isSudoActive, sudoExpiresAt, verifySudo,
    isVerifyingSudo, sudoError, emergencyLockdown, isLockingDown,
  } = useSecurityVaultViewModel();

  const { security, updateSecurityPolicy, isUpdatingPolicy } = useAccountSecuritySliceViewModel();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.security.title")}</h1>
        <p className="text-xs text-nx-ink-3 mt-1">{t("profile.security.subtitle")}</p>
      </div>

      {/* 1. W3C WebAuthn L3 Passkey & FIDO2 AAGUID Vault */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.passkeys.sectionTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">{t("profile.passkeys.sectionDesc")}</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsEnrollModalOpen(true)} data-testid="open-enroll-passkey-btn" className="text-xs font-semibold gap-1.5" disabled={!webAuthnSupported}>
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
              <Fingerprint className="h-6 w-6 text-nx-accent mx-auto" />
              <p className="text-xs font-semibold text-nx-ink">{t("profile.passkeys.noPasskeysTitle")}</p>
              <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">{t("profile.passkeys.noPasskeysDesc")}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {passkeys.map((pk) => {
                const badge = detectDeviceBadge(pk.aaguid || undefined);
                return (
                  <div key={pk.id} className="flex items-center justify-between p-3.5 rounded-xl border border-nx-line bg-nx-raised hover:border-nx-line-hi transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-nx-ink truncate">{pk.deviceName}</span>
                        <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] py-0 px-1.5">
                          {pk.modelName || badge.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-nx-ink-3 font-mono">
                        <span>{pk.credentialIdMasked}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pk.lastUsedAt ? `${t("profile.passkeys.lastUsed")}: ${pk.lastUsedAt.toLocaleDateString()}` : t("profile.passkeys.neverUsed")}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removePasskey(pk.id)} disabled={isRemovingPasskey} className="h-8 w-8 p-0 text-nx-ink-3 hover:text-destructive hover:bg-destructive/10" aria-label={t("profile.passkeys.removePasskeyAria")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Connected Enterprise SSO Identity Providers (BrandIcon) */}
      <ConnectedEnterpriseSsoCard />

      {/* 3. Biometric Sudo Mode & 2FA TOTP */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.sudo.sectionTitle")}</CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">{t("profile.sudo.sectionDesc")}</CardDescription>
          </div>
          {isSudoActive ? (
            <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-xs py-1 px-2.5 gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("profile.sudo.activeSession")}</span>
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsSudoModalOpen(true)} data-testid="step-up-sudo-btn" className="text-xs font-semibold gap-1.5">
              <Fingerprint className="h-3.5 w-3.5" />
              <span>{t("profile.sudo.stepUpBtn")}</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-nx-ink-2">
            {t("profile.sudo.infoNotice")}
            {isSudoActive && sudoExpiresAt && ` (${sudoExpiresAt.toLocaleTimeString()})`}
          </p>
          <TwoFactorStatus
            isEnabled={isTwoFactorEnabled}
            backupCodesRemaining={backupCodesRemaining}
            onRegenerateBackupCodes={() => regenerateBackupCodes("")}
            onEnable={() => begin2FaSetup()}
            onDisable={() => disable2Fa({ password: "", code: "" })}
            isEnabling={isBeginning2Fa}
          />
        </CardContent>
      </Card>

      {/* 4. Password Rotation */}
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
            <CardTitle className="text-sm font-bold text-nx-ink">{t("profile.security.changePassword")}</CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">{t("profile.security.passwordRequirements")}</CardDescription>
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

      {/* 5. Trusted IP CIDR Allowlist & Emergency Account Lockdown */}
      <SecurityAdvancedShieldSection
        trustedCidrs={security?.trustedCidrs ?? []}
        onUpdatePolicy={updateSecurityPolicy}
        isUpdatingPolicy={isUpdatingPolicy}
        onOpenLockdown={() => setIsLockdownOpen(true)}
      />

      <EnrollPasskeyModal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} onEnroll={enrollPasskey} isEnrolling={isEnrollingPasskey} enrollError={enrollError} />
      <TwoFactorWizardModal isOpen={!!twoFaSetupData} onClose={clearTwoFaSetup} setupData={twoFaSetupData} onConfirm={confirm2Fa} isConfirming={isConfirming2Fa} />
      <BiometricSudoModal isOpen={isSudoModalOpen} onClose={() => setIsSudoModalOpen(false)} onVerify={async () => { await verifySudo(); setIsSudoModalOpen(false); }} isVerifying={isVerifyingSudo} error={sudoError} />
      <EmergencyLockdownDialog isOpen={isLockdownOpen} onClose={() => setIsLockdownOpen(false)} onConfirmLockdown={emergencyLockdown} isLockingDown={isLockingDown} />
    </div>
  );
}
