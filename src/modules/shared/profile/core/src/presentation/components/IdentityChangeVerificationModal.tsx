"use client";

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
import { Badge } from "@core/ui/badge";
import { Mail, AtSign, CheckCircle2, ArrowRight } from "lucide-react";
import {
  IdentityChangeStep1,
  IdentityChangeStep2,
  IdentityChangeStep3,
  type IdentityStepUpMethod,
} from "./IdentityChangeStepPanels";

/** Props for {@link IdentityChangeVerificationModal}. */
export interface IdentityChangeVerificationModalProps {
  /** Controls modal visibility. */
  open: boolean;
  /** Target identity attribute being updated. */
  mode: "email" | "username";
  /** Existing verified email address or username. */
  currentValue: string;
  /** Visibility change callback triggered when opening or closing. */
  onOpenChange: (open: boolean) => void;
  /** Optional handler to dispatch verification OTP before commit. */
  onSendOtp?: () => Promise<unknown>;
  /** Commits the identity identifier update with verified OTP code. */
  onCommitChange: (mode: "email" | "username", newValue: string, otpCode: string) => Promise<void>;
}

/**
 * 3-step verification wizard for updating primary account email or username
 * behind step-up authentication and OTP confirmation.
 */
export function IdentityChangeVerificationModal({
  open,
  mode,
  currentValue,
  onOpenChange,
  onSendOtp,
  onCommitChange,
}: IdentityChangeVerificationModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sudoMethod, setSudoMethod] = useState<IdentityStepUpMethod>("totp");
  const [sudoCredential, setSudoCredential] = useState("");
  const [newValue, setNewValue] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmail = mode === "email";

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep(1);
      setNewValue("");
      setSudoCredential("");
      setOtpCode("");
    }
    onOpenChange(nextOpen);
  };

  const handleStep1Continue = () => {
    if (!sudoCredential.trim() && sudoMethod !== "passkey") return;
    setStep(2);
  };

  const handleStep2DispatchOtp = async () => {
    if (!newValue.trim()) return;
    setIsSubmitting(true);
    try {
      await onSendOtp?.();
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Commit = async () => {
    if (!newValue.trim() || otpCode.trim().length < 6) return;
    setIsSubmitting(true);
    try {
      await onCommitChange(mode, newValue.trim(), otpCode.trim());
      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-testid="identity-change-modal"
        className="sm:max-w-lg border border-nx-line bg-nx-surface text-nx-ink"
      >
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-nx-accent/30 bg-nx-accent-wash text-nx-accent">
                {isEmail ? (
                  <Mail className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                ) : (
                  <AtSign className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
                )}
              </div>
              <DialogTitle className="text-base font-bold text-nx-ink">
                {isEmail
                  ? t("profile.identityModal.changeEmailTitle")
                  : t("profile.identityModal.changeUsernameTitle")}
              </DialogTitle>
            </div>
            <Badge className="bg-nx-accent-fill text-nx-on-fill text-[10px] font-bold">
              {t("profile.identityModal.stepIndicator", { step, total: 3 })}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-nx-ink-2 pt-1">
            {isEmail
              ? t("profile.identityModal.changeEmailSubtitle")
              : t("profile.identityModal.changeUsernameSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 py-2" data-testid="identity-modal-steps">
          {[
            { num: 1, label: t("profile.identityModal.step1Short") },
            { num: 2, label: t("profile.identityModal.step2Short") },
            { num: 3, label: t("profile.identityModal.step3Short") },
          ].map((item) => {
            const active = step === item.num;
            const completed = step > item.num;
            return (
              <div
                key={item.num}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-nx-accent bg-nx-accent-wash text-nx-ink"
                    : completed
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-nx-line bg-nx-ground text-nx-ink-3"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ minWidth: 14, minHeight: 14 }} />
                ) : (
                  <span className="font-mono text-[10px]">{item.num}.</span>
                )}
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <IdentityChangeStep1
            currentValue={currentValue}
            sudoMethod={sudoMethod}
            sudoCredential={sudoCredential}
            onMethodChange={setSudoMethod}
            onCredentialChange={setSudoCredential}
          />
        )}

        {step === 2 && (
          <IdentityChangeStep2
            isEmail={isEmail}
            newValue={newValue}
            onNewValueChange={setNewValue}
          />
        )}

        {step === 3 && (
          <IdentityChangeStep3
            newValue={newValue}
            otpCode={otpCode}
            onOtpCodeChange={setOtpCode}
          />
        )}

        <DialogFooter className="flex items-center justify-between gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => handleClose(false)}>
            {t("profile.cancel")}
          </Button>

          {step === 1 && (
            <Button
              type="button"
              size="sm"
              data-testid="identity-step-1-next-btn"
              onClick={handleStep1Continue}
              className="bg-nx-accent-fill text-nx-on-fill font-semibold gap-1.5"
            >
              <span>{t("profile.identityModal.verifyStepUpBtn")}</span>
              <ArrowRight className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
            </Button>
          )}

          {step === 2 && (
            <Button
              type="button"
              size="sm"
              data-testid="identity-step-2-send-otp-btn"
              disabled={isSubmitting || !newValue.trim()}
              onClick={handleStep2DispatchOtp}
              className="bg-nx-accent-fill text-nx-on-fill font-semibold gap-1.5"
            >
              <span>{t("profile.identityModal.sendOtpBtn")}</span>
              <ArrowRight className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
            </Button>
          )}

          {step === 3 && (
            <Button
              type="button"
              size="sm"
              data-testid="identity-step-3-commit-btn"
              disabled={isSubmitting || otpCode.trim().length < 6}
              onClick={handleStep3Commit}
              className="bg-nx-accent-fill text-nx-on-fill font-semibold gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
              <span>{t("profile.identityModal.confirmAndCommitBtn")}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
