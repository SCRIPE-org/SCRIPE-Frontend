"use client";

/**
 * EnrollPasskeyModal
 *
 * 3-Tier W3C WebAuthn Level 3 Passkey Enrollment Wizard.
 * Offers:
 *   1. This Computer / Workstation (Windows Hello, Touch ID)
 *   2. Phone or Tablet (CaBLE Hybrid QR Bluetooth)
 *   3. Hardware Security Key (USB/NFC YubiKey, Titan)
 */
import { useState } from "react";
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
  Laptop,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import type { AuthenticatorMode } from "../../domain/entities/PasskeyCredential";

interface EnrollPasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (params: { deviceName: string; mode: AuthenticatorMode }) => Promise<unknown>;
  isEnrolling: boolean;
  enrollError: string | null;
}

/**
 * EnrollPasskeyModal Component
 *
 * 3-Tier W3C WebAuthn Level 3 Passkey Enrollment Wizard dialog.
 */
export function EnrollPasskeyModal({
  isOpen,
  onClose,
  onEnroll,
  isEnrolling,
  enrollError,
}: EnrollPasskeyModalProps) {
  const { t } = useI18n();
  const [selectedMode, setSelectedMode] = useState<AuthenticatorMode>("platform");
  const [deviceName, setDeviceName] = useState("");
  const [step, setStep] = useState<"SELECT" | "NAME" | "SUCCESS">("SELECT");

  const options = [
    {
      id: "platform" as AuthenticatorMode,
      title: t("profile.passkeys.modePlatformTitle"),
      subtitle: t("profile.passkeys.modePlatformSub"),
      description: t("profile.passkeys.modePlatformDesc"),
      icon: Laptop,
      defaultName: t("profile.passkeys.defaultNamePlatform"),
    },
    {
      id: "hybrid" as AuthenticatorMode,
      title: t("profile.passkeys.modeHybridTitle"),
      subtitle: t("profile.passkeys.modeHybridSub"),
      description: t("profile.passkeys.modeHybridDesc"),
      icon: Smartphone,
      defaultName: t("profile.passkeys.defaultNameHybrid"),
    },
    {
      id: "security-key" as AuthenticatorMode,
      title: t("profile.passkeys.modeKeyTitle"),
      subtitle: t("profile.passkeys.modeKeySub"),
      description: t("profile.passkeys.modeKeyDesc"),
      icon: KeyRound,
      defaultName: t("profile.passkeys.defaultNameKey"),
    },
  ];

  const handleSelectOption = (opt: typeof options[0]) => {
    setSelectedMode(opt.id);
    setDeviceName(opt.defaultName);
    setStep("NAME");
  };

  const handleExecuteEnrollment = async () => {
    try {
      await onEnroll({
        deviceName: deviceName.trim() || t("profile.passkeys.defaultPasskeyName"),
        mode: selectedMode,
      });
      setStep("SUCCESS");
    } catch {
      // Error handled by parent via enrollError
    }
  };

  const handleResetAndClose = () => {
    setStep("SELECT");
    setDeviceName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[520px] bg-nx-surface border-nx-line p-6">
        {step === "SELECT" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-nx-accent-wash flex items-center justify-center text-nx-accent">
                  <ShieldCheck className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                </div>
                <DialogTitle className="text-base font-bold text-nx-ink">
                  {t("profile.passkeys.modalTitle")}
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.passkeys.modalDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {options.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.id}
                    type="button"
                    variant="outline"
                    onClick={() => handleSelectOption(opt)}
                    className="w-full h-auto text-start p-3.5 rounded-xl border border-nx-line hover:border-nx-accent/60 bg-nx-raised hover:bg-nx-raised/80 transition-all flex items-start justify-start gap-3.5 group cursor-pointer whitespace-normal"
                  >
                    <div className="p-2.5 rounded-lg border border-nx-line bg-nx-surface text-nx-ink group-hover:text-nx-accent transition-colors shrink-0">
                      <Icon className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors">
                          {opt.title}
                        </span>
                        <span className="text-[10px] font-mono text-nx-ink-3 px-1.5 py-0.5 rounded bg-nx-surface border border-nx-line">
                          {opt.subtitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-nx-ink-2 mt-1 leading-relaxed font-normal">
                        {opt.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleResetAndClose} className="text-xs">
                {t("profile.common.cancel")}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "NAME" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-nx-ink">
                {t("profile.passkeys.nameDeviceTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-3">
                {t("profile.passkeys.nameDeviceDesc")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="passkey-name" className="text-xs font-semibold text-nx-ink">
                  {t("profile.passkeys.deviceNameLabel")}
                </Label>
                <Input
                  id="passkey-name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t("profile.passkeys.namePlaceholder")}
                  className="text-xs h-9 bg-nx-raised border-nx-line text-nx-ink"
                  disabled={isEnrolling}
                />
              </div>

              {enrollError && (
                <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
                  <span>{enrollError}</span>
                </div>
              )}

              <div className="rounded-lg border border-nx-line bg-nx-raised p-3 text-xs text-nx-ink-2">
                <p>{t("profile.passkeys.touchPromptNotice")}</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("SELECT")}
                disabled={isEnrolling}
                className="text-xs"
              >
                {t("profile.common.back")}
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteEnrollment}
                disabled={isEnrolling || !deviceName.trim()}
                className="text-xs font-semibold gap-1.5"
              >
                {isEnrolling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t("profile.passkeys.activatePasskeyBtn")}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "SUCCESS" && (
          <>
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success">
                <CheckCircle2 className="h-6 w-6" style={{ minWidth: 24, minHeight: 24 }} />
              </div>
              <DialogTitle className="text-base font-bold text-nx-ink">
                {t("profile.passkeys.enrollSuccessTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-3 max-w-sm">
                {t("profile.passkeys.enrollSuccessDesc")}
              </DialogDescription>
            </div>

            <DialogFooter>
              <Button size="sm" onClick={handleResetAndClose} className="w-full text-xs font-semibold">
                {t("profile.common.done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
