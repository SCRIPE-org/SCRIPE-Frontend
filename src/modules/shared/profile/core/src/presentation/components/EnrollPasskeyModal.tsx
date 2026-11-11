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
import { useState, useEffect } from "react";
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
import { Badge } from "@core/ui/badge";
import {
  Laptop,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  QrCode,
  ArrowRight,
  RotateCw,
} from "lucide-react";
import {
  detectClientDevice,
  type ClientDeviceDetection,
} from "@core/services/webauthn.service";
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
 * 3-Tier W3C WebAuthn Level 3 Passkey Enrollment Wizard dialog with client device detection.
 */
export function EnrollPasskeyModal({
  isOpen,
  onClose,
  onEnroll,
  isEnrolling,
  enrollError,
}: EnrollPasskeyModalProps) {
  const { t } = useI18n();
  const [deviceInfo, setDeviceInfo] = useState<ClientDeviceDetection | null>(null);
  const [selectedMode, setSelectedMode] = useState<AuthenticatorMode>("platform");
  const [deviceName, setDeviceName] = useState("");
  const [step, setStep] = useState<"SELECT" | "NAME" | "SUCCESS">("SELECT");

  useEffect(() => {
    if (isOpen) {
      void detectClientDevice().then((info) => {
        setDeviceInfo(info);
      });
    }
  }, [isOpen]);

  const options = [
    {
      id: "platform" as AuthenticatorMode,
      title: t("profile.passkeys.modePlatformTitle"),
      subtitle: t("profile.passkeys.modePlatformSub"),
      description: t("profile.passkeys.modePlatformDesc"),
      icon: Laptop,
      defaultName: deviceInfo?.deviceLabel || t("profile.passkeys.defaultNamePlatform"),
      isRecommended: deviceInfo?.isPlatformAvailable ?? true,
    },
    {
      id: "hybrid" as AuthenticatorMode,
      title: t("profile.passkeys.modeHybridTitle"),
      subtitle: t("profile.passkeys.modeHybridSub"),
      description: t("profile.passkeys.modeHybridDesc"),
      icon: Smartphone,
      defaultName: t("profile.passkeys.defaultNameHybrid"),
      isRecommended: false,
    },
    {
      id: "security-key" as AuthenticatorMode,
      title: t("profile.passkeys.modeKeyTitle"),
      subtitle: t("profile.passkeys.modeKeySub"),
      description: t("profile.passkeys.modeKeyDesc"),
      icon: KeyRound,
      defaultName: t("profile.passkeys.defaultNameKey"),
      isRecommended: false,
    },
  ];

  const handleSelectOption = (opt: (typeof options)[0]) => {
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
      // Error handled by parent hook via enrollError
    }
  };

  const handleResetAndClose = () => {
    setStep("SELECT");
    setDeviceName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-[540px] bg-nx-surface border-nx-line p-6">
        {step === "SELECT" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-nx-accent-wash flex items-center justify-center text-nx-accent border border-nx-accent/30">
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

            {/* Client Device Detection Banner */}
            {deviceInfo && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-nx-line bg-nx-raised text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-nx-surface border border-nx-line flex items-center justify-center text-nx-ink-2">
                    <Fingerprint className="h-4 w-4 text-nx-accent" />
                  </div>
                  <div>
                    <span className="text-nx-ink-3 text-[10px] block">
                      {t("profile.passkeys.detectedStationLabel")}
                    </span>
                    <span className="font-semibold text-nx-ink text-xs">
                      {deviceInfo.deviceLabel}
                    </span>
                  </div>
                </div>
                {deviceInfo.isPlatformAvailable ? (
                  <Badge className="bg-success/15 text-success border border-success/30 text-[10px] font-semibold py-0.5 px-2">
                    {t("profile.passkeys.biometricsReadyBadge")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px]">
                    {t("profile.passkeys.fidoSupportedBadge")}
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-3 py-2">
              {options.map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.id}
                    type="button"
                    variant="outline"
                    data-testid={`passkey-option-${opt.id}`}
                    onClick={() => handleSelectOption(opt)}
                    className="w-full h-auto text-start p-3.5 rounded-xl border border-nx-line hover:border-nx-accent/60 bg-nx-raised hover:bg-nx-raised/80 transition-all flex items-start justify-start gap-3.5 group cursor-pointer whitespace-normal relative"
                  >
                    <div className="p-2.5 rounded-lg border border-nx-line bg-nx-surface text-nx-ink group-hover:text-nx-accent transition-colors shrink-0">
                      <Icon className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors">
                            {opt.title}
                          </span>
                          {opt.isRecommended && (
                            <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/40 text-[9px] font-semibold py-0 px-1.5 flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>{t("profile.passkeys.recommendedBadge")}</span>
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-nx-ink-3 px-1.5 py-0.5 rounded bg-nx-surface border border-nx-line shrink-0">
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
                  data-testid="passkey-name-input"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t("profile.passkeys.namePlaceholder")}
                  className="text-xs h-9 bg-nx-raised border-nx-line text-nx-ink"
                  disabled={isEnrolling}
                  autoFocus
                />
              </div>

              {enrollError && (
                <div
                  data-testid="passkey-enroll-error-banner"
                  className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ minWidth: 16, minHeight: 16 }} />
                  <div className="space-y-1 flex-1">
                    <span className="font-semibold block">{t("profile.passkeys.enrollFailedNotice")}</span>
                    <span className="text-[11px] leading-relaxed block opacity-90">{enrollError}</span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-nx-line bg-nx-raised p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  {isEnrolling ? (
                    <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
                  ) : selectedMode === "platform" ? (
                    <Fingerprint className="h-4 w-4 text-nx-accent" />
                  ) : selectedMode === "hybrid" ? (
                    <QrCode className="h-4 w-4 text-nx-accent" />
                  ) : (
                    <KeyRound className="h-4 w-4 text-nx-accent" />
                  )}
                  <span className="text-xs font-semibold text-nx-ink">
                    {isEnrolling
                      ? t("profile.passkeys.waitingForTouchPrompt")
                      : t("profile.passkeys.readyToActivateTitle")}
                  </span>
                </div>
                <p className="text-[11px] text-nx-ink-2 leading-relaxed">
                  {selectedMode === "platform"
                    ? t("profile.passkeys.touchPromptNotice")
                    : selectedMode === "hybrid"
                    ? t("profile.passkeys.hybridPromptNotice")
                    : t("profile.passkeys.hardwareKeyPromptNotice")}
                </p>
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
                data-testid="passkey-activate-btn"
                onClick={handleExecuteEnrollment}
                disabled={isEnrolling || !deviceName.trim()}
                className="text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t("profile.passkeys.enrollingProgress")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("profile.passkeys.activatePasskeyBtn")}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </>
                )}
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
              <Button
                size="sm"
                data-testid="passkey-done-btn"
                onClick={handleResetAndClose}
                className="w-full text-xs font-semibold bg-nx-accent-fill text-nx-on-fill"
              >
                {t("profile.common.done")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
