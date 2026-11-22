"use client";

import Image from "next/image";
import { useI18n } from "@core/providers/i18n-provider";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Copy,
  AlertCircle,
  Loader2,
  KeyRound,
  Check,
} from "lucide-react";

/** Re-exported Step 3 backup codes confirmation panel. */
export { TwoFactorBackupStep } from "./TwoFactorBackupStepPanel";

/** Setup payload returned when initiating 2FA TOTP enrollment. */
export interface TwoFactorSetupData {
  /** Base64/data URI QR image for authenticator apps. */
  qrCodeDataUri: string;
  /** Manual Base32 secret key fallback. */
  manualEntryKey: string;
  /** Generated single-use emergency recovery codes. */
  backupCodes: string[];
}

/** Step 1 panel displaying the TOTP QR code and copyable manual secret key. */
export function TwoFactorScanStep({
  setupData,
  copiedKey,
  onCopyKey,
  onClose,
  onContinue,
}: {
  setupData: TwoFactorSetupData;
  copiedKey: boolean;
  onCopyKey: () => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  const { t } = useI18n();

  return (
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
              onClick={onCopyKey}
              className="h-9 px-3 text-xs gap-1.5 shrink-0"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedKey ? t("profile.common.copied") : t("profile.common.copy")}</span>
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          {t("profile.common.cancel")}
        </Button>
        <Button size="sm" onClick={onContinue} className="text-xs font-semibold">
          {t("profile.common.continue")}
        </Button>
      </DialogFooter>
    </>
  );
}

/** Step 2 panel verifying the authenticator setup with a 6-digit TOTP code. */
export function TwoFactorVerifyStep({
  totpCode,
  confirmError,
  isConfirming,
  onCodeChange,
  onBack,
  onVerify,
}: {
  totpCode: string;
  confirmError: string | null;
  isConfirming: boolean;
  onCodeChange: (value: string) => void;
  onBack: () => void;
  onVerify: () => void;
}) {
  const { t } = useI18n();

  return (
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
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
        <Button variant="outline" size="sm" onClick={onBack} disabled={isConfirming} className="text-xs">
          {t("profile.common.back")}
        </Button>
        <Button
          size="sm"
          onClick={onVerify}
          disabled={isConfirming || totpCode.length < 6}
          className="text-xs font-semibold gap-1.5"
        >
          {isConfirming && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {t("profile.security.twoFactor.setup.verifyButton")}
        </Button>
      </DialogFooter>
    </>
  );
}
