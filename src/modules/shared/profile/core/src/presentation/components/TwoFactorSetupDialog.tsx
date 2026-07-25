// FILE-EXCEPTION: file length
"use client";

/**
 * TwoFactorSetupDialog
 *
 * Multi-step dialog for enabling 2FA:
 * 1. Show QR code + manual entry key
 * 2. User enters verification code from authenticator
 * 3. Show backup codes with download option
 */
import { useState, useCallback } from "react";
import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Copy,
  Download,
  ShieldCheck,
  QrCode,
  KeyRound,
  Check,
  AlertTriangle,
} from "lucide-react";
import type { Enable2FAResult } from "../../../src/domain/interfaces/IProfileRepository";

type SetupStep = "qr-code" | "verify" | "backup-codes";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupData: Enable2FAResult | null;
  onConfirm: (code: string) => Promise<unknown>;
  isConfirming: boolean;
  confirmError: string | null;
}

// The one size override every slot in this dialog shares. Everything else —
// border, radius, ground fill, tabular digits, the micro-speed transition and
// the active slot's shadow-nx-focus lit edge — comes from InputOTPSlot's own
// base styling; hand-tuning border/ring/colour per slot is exactly what
// bypassed that shared focus token before.
const OTP_SLOT = "h-14 w-12 text-xl font-semibold";

/**
 * Presentation UI component rendering the two factor setup dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  setupData,
  onConfirm,
  isConfirming,
  confirmError,
}: TwoFactorSetupDialogProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<SetupStep>("qr-code");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  const handleVerify = useCallback(async () => {
    if (code.length < 6) {
      setError(t("auth.twoFactor.enterCode"));
      return;
    }
    setError("");
    try {
      await onConfirm(code);
      setStep("backup-codes");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.twoFactor.invalidCode"));
    }
  }, [code, onConfirm, t]);

  const handleCopyKey = useCallback(() => {
    if (setupData?.manualEntryKey) {
      navigator.clipboard.writeText(setupData.manualEntryKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  }, [setupData]);

  const handleDownloadCodes = useCallback(() => {
    if (!setupData?.backupCodes) return;
    const content = [
      "=== TWO-FACTOR AUTHENTICATION BACKUP CODES ===",
      "",
      "Store these codes in a safe place.",
      "Each code can only be used once.",
      "",
      ...setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`),
      "",
      `Generated: ${new Date().toISOString()}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [setupData]);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        // Reset state when closing
        setStep("qr-code");
        setCode("");
        setError("");
        setCopiedKey(false);
      }
      onOpenChange(isOpen);
    },
    [onOpenChange]
  );

  if (!setupData) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {/* Step 1: QR Code */}
        {step === "qr-code" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-nx-accent" aria-hidden="true" />
                <DialogTitle>{t("profile.security.twoFactor.setup.scanQR")}</DialogTitle>
              </div>
              <DialogDescription>
                {t("profile.security.twoFactor.setup.scanDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-4">
              {/* QR Code Image — a white backdrop is a scanner requirement, not
                  a design choice: a QR reader needs a light quiet zone around
                  the dark modules regardless of theme, so this is exempt from
                  the token-only colour rule. */}
              <div className="rounded-nx-md bg-white p-4">
                <Image
                  src={setupData.qrCodeDataUri}
                  alt={t("profile.security.twoFactor.setup.qrAlt")}
                  width={192}
                  height={192}
                  className="h-48 w-48"
                  unoptimized
                />
              </div>

              {/* Manual Entry Key */}
              <div className="w-full">
                <p className="mb-2 text-center text-xs text-nx-ink-2">
                  {t("profile.security.twoFactor.setup.manualEntry")}
                </p>
                <div className="flex items-center gap-2 rounded-nx-control border border-nx-line bg-nx-raised p-3">
                  <code className="flex-1 break-all text-center font-mono text-sm tracking-wider text-nx-ink">
                    {setupData.manualEntryKey}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={handleCopyKey}
                    aria-label={
                      copiedKey ? t("common.copied") : t("profile.security.twoFactor.setup.copyKey")
                    }
                  >
                    {copiedKey ? (
                      <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={() => setStep("verify")}>{t("common.next")}</Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === "verify" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-nx-accent" aria-hidden="true" />
                <DialogTitle>{t("profile.security.twoFactor.setup.verifyTitle")}</DialogTitle>
              </div>
              <DialogDescription>
                {t("profile.security.twoFactor.setup.verifyDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4 py-6">
              {(error || confirmError) && (
                <Alert variant="destructive" className="w-full">
                  <AlertTriangle aria-hidden="true" />
                  <AlertDescription>{error || confirmError}</AlertDescription>
                </Alert>
              )}

              <div dir="ltr">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={isConfirming}
                  onComplete={handleVerify}
                  className="gap-2"
                >
                  <InputOTPGroup className="gap-1.5">
                    <InputOTPSlot index={0} className={OTP_SLOT} />
                    <InputOTPSlot index={1} className={OTP_SLOT} />
                    <InputOTPSlot index={2} className={OTP_SLOT} />
                  </InputOTPGroup>
                  <span className="mx-1 select-none text-xl font-light text-nx-ink-3" aria-hidden="true">
                    –
                  </span>
                  <InputOTPGroup className="gap-1.5">
                    <InputOTPSlot index={3} className={OTP_SLOT} />
                    <InputOTPSlot index={4} className={OTP_SLOT} />
                    <InputOTPSlot index={5} className={OTP_SLOT} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("qr-code")} disabled={isConfirming}>
                {t("common.back")}
              </Button>
              <Button onClick={handleVerify} disabled={isConfirming || code.length < 6}>
                {isConfirming ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="inline" showText={false} />
                    <span>{t("auth.twoFactor.verifying")}</span>
                  </div>
                ) : (
                  t("auth.twoFactor.verify")
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3: Backup Codes */}
        {step === "backup-codes" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-success" aria-hidden="true" />
                <DialogTitle>{t("profile.security.twoFactor.setup.backupTitle")}</DialogTitle>
              </div>
              <DialogDescription>
                {t("profile.security.twoFactor.setup.backupDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="grid grid-cols-2 gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-4">
                {setupData.backupCodes.map((code, i) => (
                  <code
                    key={i}
                    className="rounded-nx-control border border-nx-line bg-nx-ground px-3 py-1.5 text-center font-mono text-sm text-nx-ink tabular-nums"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <p className="mt-3 text-center text-xs text-nx-ink-2">
                {t("profile.security.twoFactor.setup.backupWarning")}
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={handleDownloadCodes}>
                <Download className="me-2 h-4 w-4" aria-hidden="true" />
                {t("profile.security.twoFactor.setup.download")}
              </Button>
              <Button className="flex-1" onClick={() => handleClose(false)}>
                {t("common.done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
