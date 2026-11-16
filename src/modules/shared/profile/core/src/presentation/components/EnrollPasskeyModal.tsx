"use client";

/**
 * EnrollPasskeyModal
 *
 * 3-Tier W3C WebAuthn Level 3 Passkey Enrollment Wizard.
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
import { Laptop, Smartphone, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { usePasskeyDeviceDetection } from "../viewmodels/usePasskeyDeviceDetection";
import {
  EnrollPasskeyNameStep,
  EnrollPasskeySelectStep,
  type PasskeyOptionItem,
} from "./EnrollPasskeyStepPanels";
import type { AuthenticatorMode } from "../../domain/entities/PasskeyCredential";

/** Props for {@link EnrollPasskeyModal}. */
export interface EnrollPasskeyModalProps {
  /** Controls modal visibility. */
  isOpen: boolean;
  /** Closes the modal and resets wizard progress. */
  onClose: () => void;
  /** Executes passkey registration against WebAuthn & backend API. */
  onEnroll: (params: { deviceName: string; mode: AuthenticatorMode }) => Promise<unknown>;
  /** True while enrollment is in flight. */
  isEnrolling: boolean;
  /** Enrollment error message if registration failed. */
  enrollError: string | null;
}

/**
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
  const deviceInfo = usePasskeyDeviceDetection(isOpen);
  const [selectedMode, setSelectedMode] = useState<AuthenticatorMode>("platform");
  const [deviceName, setDeviceName] = useState("");
  const [step, setStep] = useState<"SELECT" | "NAME" | "SUCCESS">("SELECT");

  const options: PasskeyOptionItem[] = [
    {
      id: "platform",
      title: t("profile.passkeys.modePlatformTitle"),
      subtitle: t("profile.passkeys.modePlatformSub"),
      description: t("profile.passkeys.modePlatformDesc"),
      icon: Laptop,
      defaultName: deviceInfo?.deviceLabel || t("profile.passkeys.defaultNamePlatform"),
      isRecommended: deviceInfo?.isPlatformAvailable ?? true,
    },
    {
      id: "hybrid",
      title: t("profile.passkeys.modeHybridTitle"),
      subtitle: t("profile.passkeys.modeHybridSub"),
      description: t("profile.passkeys.modeHybridDesc"),
      icon: Smartphone,
      defaultName: t("profile.passkeys.defaultNameHybrid"),
      isRecommended: false,
    },
    {
      id: "security-key",
      title: t("profile.passkeys.modeKeyTitle"),
      subtitle: t("profile.passkeys.modeKeySub"),
      description: t("profile.passkeys.modeKeyDesc"),
      icon: KeyRound,
      defaultName: t("profile.passkeys.defaultNameKey"),
      isRecommended: false,
    },
  ];

  const handleSelectOption = (opt: PasskeyOptionItem) => {
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
            <EnrollPasskeySelectStep
              deviceInfo={deviceInfo}
              options={options}
              onSelectOption={handleSelectOption}
              onCancel={handleResetAndClose}
            />
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
            <EnrollPasskeyNameStep
              selectedMode={selectedMode}
              deviceName={deviceName}
              isEnrolling={isEnrolling}
              enrollError={enrollError}
              onDeviceNameChange={setDeviceName}
              onBack={() => setStep("SELECT")}
              onActivate={handleExecuteEnrollment}
            />
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
