"use client";

/**
 * TwoFactorWizardModal
 *
 * Modernized 3-step TOTP 2FA Activation Wizard.
 * Step 1: Scan QR Code & Manual Secret Key
 * Step 2: Verification with 6-digit TOTP code
 * Step 3: 10 Emergency Backup Codes with 1-click copy & download
 */
import { useState } from "react";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  ShieldAlert,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Check,
} from "lucide-react";

interface TwoFactorWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  setupData: {
    qrCodeDataUri: string;
    manualEntryKey: string;
    backupCodes: string[];
  } | null;
  onConfirm: (code: string) => Promise<unknown>;
  isConfirming: boolean;
}

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

  const handleCopyKey = () => {
    if (!setupData?.manualEntryKey) return;
    navigator.clipboard.writeText(setupData.manualEntryKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    navigator.clipboard.writeText(setupData.backupCodes.join("\n"));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
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
    } catch (err: any) {
      setConfirmError(err?.message || t("profile.security.twoFactor.setup.invalidCode"));
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] bg-nx-surface border-nx-line p-6">
        {currentStep === "SCAN" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-nx-accent-wash flex items-center justify-center text-nx-accent">
                  <KeyRound className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <DialogTitle className="text-base font-bold text-nx-ink">
                  {t("profile.security.twoFactor.setup.scanQR")}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.security.twoFactor.setup.scanDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* QR Image Container */}
              <div className="flex justify-center p-4 rounded-xl bg-[var(--scripe-white)] border border-nx-line w-fit mx-auto">
                {setupData.qrCodeDataUri ? (
                  <Image
                    src={setupData.qrCodeDataUri}
                    alt={t("profile.security.twoFactor.setup.qrAlt")}
                    width={180}
                    height={180}
                    className="h-44 w-44 object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center text-xs text-nx-ink-3">
                    {t("profile.security.twoFactor.setup.qrUnavailable")}
                  </div>
                )}
              </div>

              {/* Manual Secret Key */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-nx-ink-3">
                  {t("profile.security.twoFactor.setup.manualEntry")}
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-xs font-semibold px-3 py-2 rounded-lg bg-nx-raised border border-nx-line text-nx-ink truncate select-all">
                    {setupData.manualEntryKey}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyKey}
                    className="h-9 px-3 text-xs gap-1.5 shrink-0"
                  >
                    {copiedKey ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey ? t("profile.common.copied") : t("profile.common.copy")}</span>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleClose} className="text-xs">
                {t("profile.common.cancel")}
              </Button>
              <Button size="sm" onClick={() => setCurrentStep("VERIFY")} className="text-xs font-semibold">
                {t("profile.common.continue")}
              </Button>
            </DialogFooter>
          </>
        )}

        {currentStep === "VERIFY" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-nx-ink">
                {t("profile.security.twoFactor.setup.verifyTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.security.twoFactor.setup.verifyDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="totp-input" className="text-xs font-semibold text-nx-ink">
                  {t("profile.security.twoFactorCode")}
                </Label>
                <Input
                  id="totp-input"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-center tracking-widest text-lg font-bold h-12 bg-nx-raised border-nx-line text-nx-ink"
                  autoFocus
                  disabled={isConfirming}
                />
              </div>

              {confirmError && (
                <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
                  <span>{confirmError}</span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep("SCAN")}
                disabled={isConfirming}
                className="text-xs"
              >
                {t("profile.common.back")}
              </Button>
              <Button
                size="sm"
                onClick={handleVerify}
                disabled={isConfirming || totpCode.length < 6}
                className="text-xs font-semibold gap-1.5"
              >
                {isConfirming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("profile.security.twoFactor.setup.verifyButton")}
              </Button>
            </DialogFooter>
          </>
        )}

        {currentStep === "BACKUP" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <CheckCircle2 className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <DialogTitle className="text-base font-bold text-nx-ink">
                  {t("profile.security.twoFactor.setup.backupTitle")}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.security.twoFactor.setup.backupDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" style={{ minWidth: 16, minHeight: 16 }} />
                <p>{t("profile.security.twoFactor.setup.backupWarning")}</p>
              </div>

              {/* 10 Backup Codes Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-nx-raised border border-nx-line">
                {setupData.backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="font-mono text-xs font-semibold text-center py-1.5 px-2 rounded bg-nx-surface border border-nx-line text-nx-ink"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBackupCodes}
                  className="flex-1 text-xs gap-1.5"
                >
                  {copiedBackupCodes ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedBackupCodes ? t("profile.common.copied") : t("profile.security.twoFactor.setup.copyCodes")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadBackupCodes}
                  className="flex-1 text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{t("profile.security.twoFactor.setup.download")}</span>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={handleClose} className="w-full text-xs font-semibold">
                {t("profile.common.done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
