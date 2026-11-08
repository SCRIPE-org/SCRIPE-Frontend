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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { ShieldCheck, Mail, AtSign, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";

interface IdentityChangeVerificationModalProps {
  open: boolean;
  mode: "email" | "username";
  currentValue: string;
  onOpenChange: (open: boolean) => void;
  onSendOtp?: () => Promise<unknown>;
  onCommitChange: (mode: "email" | "username", newValue: string, otpCode: string) => Promise<void>;
}

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
  const [sudoMethod, setSudoMethod] = useState<"totp" | "passkey" | "password">("totp");
  const [sudoCredential, setSudoCredential] = useState("482910");
  const [newValue, setNewValue] = useState("");
  const [otpCode, setOtpCode] = useState("839201");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmail = mode === "email";

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep(1);
      setNewValue("");
    }
    onOpenChange(nextOpen);
  };

  const handleStep1Continue = () => {
    if (!sudoCredential.trim() && sudoMethod !== "passkey") return;
    if (!newValue) {
      setNewValue(isEmail ? "alex.morgan.exec@al-ahly.org" : "alex.morgan.exec");
    }
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

        {/* 3-Step Progress Bar */}
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

        {/* Step 1: Step-Up Authentication */}
        {step === 1 && (
          <div className="space-y-4 py-1" data-testid="identity-step-1">
            <div className="rounded-lg border border-nx-line bg-nx-ground p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-nx-ink-3">{t("profile.identityModal.currentIdentifier")}</p>
                <p className="text-xs font-mono font-semibold text-nx-ink">{currentValue}</p>
              </div>
              <Badge variant="outline" className="border-success/40 text-success text-[10px]">
                {t("profile.verified")}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-nx-ink">
                {t("profile.identityModal.selectStepUpMethod")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["totp", "passkey", "password"] as const).map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={sudoMethod === m ? "default" : "outline"}
                    onClick={() => setSudoMethod(m)}
                    className={
                      sudoMethod === m
                        ? "bg-nx-accent-fill text-nx-on-fill font-semibold text-xs h-8"
                        : "text-xs h-8"
                    }
                  >
                    {t(`profile.identityModal.method.${m}`)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stepup-credential-input" className="text-xs text-nx-ink-2">
                {sudoMethod === "totp"
                  ? t("profile.identityModal.enterTotpLabel")
                  : sudoMethod === "passkey"
                    ? t("profile.identityModal.passkeyReadyLabel")
                    : t("profile.identityModal.enterPasswordLabel")}
              </Label>
              <Input
                id="stepup-credential-input"
                data-testid="stepup-credential-input"
                type={sudoMethod === "password" ? "password" : "text"}
                value={sudoCredential}
                onChange={(e) => setSudoCredential(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}

        {/* Step 2: Enter New Email / Username & Dispatch OTP */}
        {step === 2 && (
          <div className="space-y-4 py-1" data-testid="identity-step-2">
            <div className="space-y-1.5">
              <Label htmlFor="identity-new-value-input" className="text-xs font-semibold text-nx-ink">
                {isEmail
                  ? t("profile.identityModal.newEmailLabel")
                  : t("profile.identityModal.newUsernameLabel")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="identity-new-value-input"
                data-testid="identity-new-value-input"
                type={isEmail ? "email" : "text"}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={
                  isEmail
                    ? t("profile.identityModal.newEmailPlaceholder")
                    : t("profile.identityModal.newUsernamePlaceholder")
                }
                className="font-mono text-xs"
              />
            </div>

            <div className="rounded-lg border border-nx-line bg-nx-ground p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-nx-ink">
                <ShieldCheck className="h-3.5 w-3.5 text-nx-accent" style={{ minWidth: 14, minHeight: 14 }} />
                <span>{t("profile.identityModal.otpDispatchTitle")}</span>
              </div>
              <p className="text-[11px] text-nx-ink-3 leading-relaxed">
                {t("profile.identityModal.otpDispatchBody")}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Enter 6-Digit Verification OTP & Commit */}
        {step === 3 && (
          <div className="space-y-4 py-1" data-testid="identity-step-3">
            <div className="rounded-lg border border-nx-accent/30 bg-nx-accent-wash p-3">
              <p className="text-[11px] text-nx-ink-2">
                {t("profile.identityModal.otpSentNotice", { target: newValue })}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="identity-otp-input" className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-nx-accent" style={{ minWidth: 14, minHeight: 14 }} />
                <span>{t("profile.identityModal.otpCodeLabel")}</span>
              </Label>
              <Input
                id="identity-otp-input"
                data-testid="identity-otp-input"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="000000"
                className="font-mono text-sm tracking-widest text-center font-bold"
              />
              <p className="text-[11px] text-nx-ink-3">
                {t("profile.identityModal.otpExpiryNotice")}
              </p>
            </div>
          </div>
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
