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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Copy, Download, ShieldCheck, QrCode, KeyRound, Check } from "lucide-react";
import type { Enable2FAResult } from "../../../src/domain/interfaces/IProfileRepository";

type SetupStep = "qr-code" | "verify" | "backup-codes";

interface TwoFactorSetupDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      setupData: Enable2FAResult | null;
      onConfirm: (code: string) => Promise<void>;
      isConfirming: boolean;
      confirmError: string | null;
}

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
                  setError(
                        err instanceof Error
                              ? err.message
                              : t("auth.twoFactor.invalidCode")
                  );
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
                                                <QrCode className="h-5 w-5 text-primary" />
                                                <DialogTitle>
                                                      {t("profile.security.twoFactor.setup.scanQR")}
                                                </DialogTitle>
                                          </div>
                                          <DialogDescription>
                                                {t("profile.security.twoFactor.setup.scanDescription")}
                                          </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex flex-col items-center gap-4 py-4">
                                          {/* QR Code Image */}
                                          <div className="p-4 bg-white rounded-xl">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                      src={setupData.qrCodeDataUri}
                                                      alt="2FA QR Code"
                                                      className="w-48 h-48"
                                                />
                                          </div>

                                          {/* Manual Entry Key */}
                                          <div className="w-full">
                                                <p className="text-xs text-muted-foreground mb-2 text-center">
                                                      {t("profile.security.twoFactor.setup.manualEntry")}
                                                </p>
                                                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                                      <code className="flex-1 text-sm font-mono text-center tracking-wider break-all">
                                                            {setupData.manualEntryKey}
                                                      </code>
                                                      <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="flex-shrink-0 h-8 w-8"
                                                            onClick={handleCopyKey}
                                                      >
                                                            {copiedKey ? (
                                                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                            ) : (
                                                                  <Copy className="h-3.5 w-3.5" />
                                                            )}
                                                      </Button>
                                                </div>
                                          </div>
                                    </div>

                                    <DialogFooter>
                                          <Button
                                                variant="outline"
                                                onClick={() => handleClose(false)}
                                          >
                                                {t("common.cancel")}
                                          </Button>
                                          <Button onClick={() => setStep("verify")}>
                                                {t("common.next")}
                                          </Button>
                                    </DialogFooter>
                              </>
                        )}

                        {/* Step 2: Verify Code */}
                        {step === "verify" && (
                              <>
                                    <DialogHeader>
                                          <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-5 w-5 text-primary" />
                                                <DialogTitle>
                                                      {t("profile.security.twoFactor.setup.verifyTitle")}
                                                </DialogTitle>
                                          </div>
                                          <DialogDescription>
                                                {t("profile.security.twoFactor.setup.verifyDescription")}
                                          </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex flex-col items-center gap-4 py-6">
                                          {(error || confirmError) && (
                                                <div className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                                      {error || confirmError}
                                                </div>
                                          )}

                                          <InputOTP
                                                maxLength={6}
                                                value={code}
                                                onChange={setCode}
                                                disabled={isConfirming}
                                                onComplete={handleVerify}
                                          >
                                                <InputOTPGroup>
                                                      <InputOTPSlot index={0} />
                                                      <InputOTPSlot index={1} />
                                                      <InputOTPSlot index={2} />
                                                </InputOTPGroup>
                                                <span className="text-muted-foreground">-</span>
                                                <InputOTPGroup>
                                                      <InputOTPSlot index={3} />
                                                      <InputOTPSlot index={4} />
                                                      <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                          </InputOTP>
                                    </div>

                                    <DialogFooter>
                                          <Button
                                                variant="outline"
                                                onClick={() => setStep("qr-code")}
                                                disabled={isConfirming}
                                          >
                                                {t("common.back")}
                                          </Button>
                                          <Button
                                                onClick={handleVerify}
                                                disabled={isConfirming || code.length < 6}
                                          >
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
                                                <KeyRound className="h-5 w-5 text-emerald-500" />
                                                <DialogTitle>
                                                      {t("profile.security.twoFactor.setup.backupTitle")}
                                                </DialogTitle>
                                          </div>
                                          <DialogDescription>
                                                {t("profile.security.twoFactor.setup.backupDescription")}
                                          </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-4">
                                          <div className="grid grid-cols-2 gap-2 p-4 bg-muted/30 rounded-lg border border-border/40">
                                                {setupData.backupCodes.map((code, i) => (
                                                      <code
                                                            key={i}
                                                            className="text-sm font-mono text-center py-1.5 px-3 bg-background rounded border"
                                                      >
                                                            {code}
                                                      </code>
                                                ))}
                                          </div>

                                          <p className="text-xs text-muted-foreground mt-3 text-center">
                                                {t("profile.security.twoFactor.setup.backupWarning")}
                                          </p>
                                    </div>

                                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                                          <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={handleDownloadCodes}
                                          >
                                                <Download className="h-4 w-4 me-2" />
                                                {t("profile.security.twoFactor.setup.download")}
                                          </Button>
                                          <Button
                                                className="flex-1"
                                                onClick={() => handleClose(false)}
                                          >
                                                {t("common.done")}
                                          </Button>
                                    </DialogFooter>
                              </>
                        )}
                  </DialogContent>
            </Dialog>
      );
}
