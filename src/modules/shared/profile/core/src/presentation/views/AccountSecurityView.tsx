"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useSecurityVaultViewModel } from "../viewmodels/useSecurityVaultViewModel";
import { useExternalLoginsViewModel } from "../viewmodels/useExternalLoginsViewModel";
import {
  useAccountContextSliceViewModel,
  useAccountSecuritySliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { EnrollPasskeyModal } from "../components/EnrollPasskeyModal";
import { TwoFactorWizardModal } from "../components/TwoFactorWizardModal";
import { EmergencyLockdownDialog } from "../components/EmergencyLockdownDialog";
import { PasswordChangeForm } from "../components/PasswordChangeForm";
import { SecurityAdvancedShieldSection } from "../components/SecurityAdvancedShieldSection";
import { ConnectedEnterpriseSsoCard } from "../components/ConnectedEnterpriseSsoCard";
import { SecurityPageSkeleton } from "../components/AccountSkeletons";
import { PasskeyVaultSection } from "../sections/security/PasskeyVaultSection";
import { SudoSessionCardSection } from "../sections/security/SudoSessionCardSection";
import { StandaloneTotpSection } from "../sections/security/StandaloneTotpSection";
import { PasskeyRenameDeleteModals } from "../sections/security/PasskeyRenameDeleteModals";
import { DisableTwoFactorModal } from "../sections/security/DisableTwoFactorModal";
import { RegenerateBackupCodesModal } from "../sections/security/RegenerateBackupCodesModal";
import type { PasskeyCredential } from "../../domain/entities/PasskeyCredential";
import type { ChangePasswordRequest } from "../../domain/interfaces/IProfileRepository";
import { Lock } from "lucide-react";

/**
 * Security vault view (/account/security) composing Passkey Vault, Enterprise SSO,
 * Unified Sudo status, standalone TOTP 2FA, password rotation, and CIDR lockdown controls.
 */
export function AccountSecurityView() {
  const { t, language } = useI18n();
  const vm = useSecurityVaultViewModel();
  const { principalContext, featureFlags } = useAccountContextSliceViewModel();
  const { externalLogins } = useExternalLoginsViewModel();
  const { security, isLoadingSecurity, updateSecurityPolicy, isUpdatingPolicy, updatePolicyError } =
    useAccountSecuritySliceViewModel();
  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const showSsoCard =
    security?.isSsoFeatureEnabled !== false &&
    featureFlags?.externalSsoEnabled !== false &&
    (!isPlatformAdmin || externalLogins.length > 0);
  const showTotpSection =
    security?.isTwoFactorFeatureEnabled !== false &&
    featureFlags?.twoFactorEnabled !== false;

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isLockdownOpen, setIsLockdownOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [renameTarget, setRenameTarget] = useState<PasskeyCredential | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PasskeyCredential | null>(null);
  const [isDisable2FaOpen, setIsDisable2FaOpen] = useState(false);
  const [isRegenCodesOpen, setIsRegenCodesOpen] = useState(false);
  const [sudoRemainingSeconds, setSudoRemainingSeconds] = useState(0);
  const { sudoExpiresAt, isSudoActive } = vm;

  useEffect(() => {
    if (!isSudoActive || !sudoExpiresAt) return;
    const tick = () => {
      setSudoRemainingSeconds(Math.max(0, Math.floor((sudoExpiresAt.getTime() - Date.now()) / 1000)));
    };
    const kickoff = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, [isSudoActive, sudoExpiresAt]);

  if (vm.isLoadingPasskeys && isLoadingSecurity && vm.passkeys.length === 0 && !security) {
    return <SecurityPageSkeleton />;
  }

  const handlePasswordSubmit = async (data: ChangePasswordRequest) => {
    setPasswordSuccess(false);
    await vm.changePassword(data);
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">{t("profile.security.title")}</h1>
        <p className="text-xs text-nx-ink-3 mt-1">{t("profile.security.subtitle")}</p>
      </div>
      <PasskeyVaultSection
        t={t}
        dateLocale={language === "ar" ? "ar-EG" : "en-US"}
        passkeys={vm.passkeys}
        isLoadingPasskeys={vm.isLoadingPasskeys}
        webAuthnSupported={vm.webAuthnSupported}
        isRemovingPasskey={vm.isRemovingPasskey}
        detectDeviceBadge={vm.detectDeviceBadge}
        onOpenEnroll={() => setIsEnrollModalOpen(true)}
        onOpenRename={setRenameTarget}
        onOpenDelete={setDeleteTarget}
      />
      {showSsoCard && <ConnectedEnterpriseSsoCard />}
      <SudoSessionCardSection
        t={t}
        isSudoActive={vm.isSudoActive}
        sudoRemainingSeconds={isSudoActive && sudoExpiresAt ? sudoRemainingSeconds : 0}
        sudoMethodUsed={vm.sudoMethodUsed}
        onOpenSudoModal={() => vm.openSudoModal()}
        onLockSudoSession={() => void vm.lockSudoSession()}
      />
      {showTotpSection && (
        <StandaloneTotpSection
          t={t}
          isTwoFactorEnabled={vm.isTwoFactorEnabled}
          backupCodesRemaining={vm.backupCodesRemaining ?? 0}
          isEnabling={vm.isBeginning2Fa}
          onEnable={() => vm.begin2FaSetup()}
          onDisable={() => setIsDisable2FaOpen(true)}
          onRegenerateBackupCodes={() => setIsRegenCodesOpen(true)}
        />
      )}
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
            isTwoFactorEnabled={vm.isTwoFactorEnabled}
            onSubmit={handlePasswordSubmit}
            isSubmitting={vm.isChangingPassword}
            submitError={vm.changePasswordError}
            success={passwordSuccess}
          />
        </CardContent>
      </Card>
      <SecurityAdvancedShieldSection
        trustedCidrs={security?.trustedCidrs ?? []}
        currentClientIp={security?.currentClientIp}
        rowVersion={security?.rowVersion}
        onUpdatePolicy={updateSecurityPolicy}
        isUpdatingPolicy={isUpdatingPolicy}
        policyError={updatePolicyError}
        onOpenLockdown={() => setIsLockdownOpen(true)}
      />
      <EnrollPasskeyModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        onEnroll={vm.enrollPasskey}
        isEnrolling={vm.isEnrollingPasskey}
        enrollError={vm.enrollError}
      />
      <TwoFactorWizardModal
        isOpen={showTotpSection && !!vm.twoFaSetupData}
        onClose={vm.clearTwoFaSetup}
        setupData={vm.twoFaSetupData}
        onConfirm={vm.confirm2Fa}
        isConfirming={vm.isConfirming2Fa}
      />
      <EmergencyLockdownDialog
        isOpen={isLockdownOpen}
        onClose={() => setIsLockdownOpen(false)}
        onConfirmLockdown={vm.emergencyLockdown}
        isLockingDown={vm.isLockingDown}
      />
      <PasskeyRenameDeleteModals
        t={t}
        totalPasskeysCount={vm.passkeys.length}
        renameTarget={renameTarget}
        isRenamingPasskey={vm.isRenamingPasskey}
        deleteTarget={deleteTarget}
        isRemovingPasskey={vm.isRemovingPasskey}
        onRenameClose={() => setRenameTarget(null)}
        onRenameSubmit={async (id, newName) => {
          await vm.renamePasskey({ id, newName });
        }}
        onDeleteClose={() => setDeleteTarget(null)}
        onConfirmDelete={vm.removePasskey}
      />
      <DisableTwoFactorModal
        t={t}
        open={showTotpSection && isDisable2FaOpen}
        onOpenChange={setIsDisable2FaOpen}
        isSubmitting={vm.isDisabling2Fa}
        submitError={vm.disable2FaError}
        onSubmit={vm.disable2Fa}
      />
      <RegenerateBackupCodesModal
        t={t}
        open={showTotpSection && isRegenCodesOpen}
        onOpenChange={setIsRegenCodesOpen}
        isSubmitting={vm.isRegeneratingCodes}
        submitError={vm.regenerateCodesError}
        onRegenerate={vm.regenerateBackupCodes}
      />
    </div>
  );
}
