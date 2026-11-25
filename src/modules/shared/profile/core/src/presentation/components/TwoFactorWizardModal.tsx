"use client";

/**
 * TwoFactorWizardModal
 *
 * Modernized 3-step TOTP 2FA Activation Wizard (QR Scan -> OTP Verify -> Emergency Backup Codes).
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Dialog, DialogContent } from "@core/ui/dialog";
import {
  TwoFactorBackupStep,
  TwoFactorScanStep,
  TwoFactorVerifyStep,
  type TwoFactorSetupData,
} from "./TwoFactorWizardStepPanels";

/** Props for {@link TwoFactorWizardModal}. */
export interface TwoFactorWizardModalProps {
  /** Controls wizard dialog visibility. */
  isOpen: boolean;
  /** Closes and resets the wizard dialog. */
  onClose: () => void;
  /** QR setup payload and backup codes returned by initialization endpoint. */
  setupData: TwoFactorSetupData | null;
  /** Confirms TOTP enrollment by verifying the user's 6-digit authenticator code. */
  onConfirm: (code: string) => Promise<unknown>;
  /** True while confirmation request is in flight. */
  isConfirming: boolean;
}

/**
 * 3-step TOTP Two-Factor Authentication activation wizard modal.
 */
export function TwoFactorWizardModal({
  isOpen,
  onClose,
  setupData,
  onConfirm,
  isConfirming,
}: TwoFactorWizardModalProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<"SCAN" | "VERIFY" | "BACKUP">("SCAN");
  const [totpCode, setTotpCode] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const handleCopyKey = async () => {
    if (!setupData?.manualEntryKey) return;
    try {
      await navigator.clipboard.writeText(setupData.manualEntryKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      /* ignore clipboard unavailability in restricted contexts */
    }
  };

  const handleCopyBackupCodes = async () => {
    if (!setupData?.backupCodes) return;
    try {
      await navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
      setCopiedBackupCodes(true);
      setTimeout(() => setCopiedBackupCodes(false), 2000);
    } catch {
      /* ignore clipboard unavailability in restricted contexts */
    }
  };

  const handleDownloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    const content = `SCRIPE Sports Operations — 2FA Emergency Backup Codes\nGenerated: ${new Date().toISOString()}\n\nEach code can only be used once:\n\n${setupData.backupCodes.join("\n")}\n\nKeep these codes in a secure, encrypted vault.`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scripe_2fa_backup_codes_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleVerify = async () => {
    if (!totpCode.trim()) return;
    setConfirmError(null);
    try {
      await onConfirm(totpCode.trim());
      setCurrentStep("BACKUP");
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message;
      setConfirmError(message || t("profile.security.twoFactor.setup.invalidCode"));
    }
  };

  const handleClose = () => {
    setCurrentStep("SCAN");
    setTotpCode("");
    setConfirmError(null);
    onClose();
  };

  if (!setupData) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isConfirming) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px] bg-nx-surface border-nx-line p-6">
        {currentStep === "SCAN" && (
          <TwoFactorScanStep
            setupData={setupData}
            copiedKey={copiedKey}
            onCopyKey={handleCopyKey}
            onClose={handleClose}
            onContinue={() => setCurrentStep("VERIFY")}
          />
        )}

        {currentStep === "VERIFY" && (
          <TwoFactorVerifyStep
            totpCode={totpCode}
            confirmError={confirmError}
            isConfirming={isConfirming}
            onCodeChange={setTotpCode}
            onBack={() => setCurrentStep("SCAN")}
            onVerify={handleVerify}
          />
        )}

        {currentStep === "BACKUP" && (
          <TwoFactorBackupStep
            backupCodes={setupData.backupCodes}
            copiedBackupCodes={copiedBackupCodes}
            onCopyCodes={handleCopyBackupCodes}
            onDownloadCodes={handleDownloadBackupCodes}
            onDone={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
