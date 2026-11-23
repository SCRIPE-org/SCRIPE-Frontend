"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSudoStore } from "@core/store/useSudoStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Mail, AtSign, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { useSudoViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { computeAllowedFactors, resolveSudoErrorMessage } from "../utils/sudo-factors.utils";
import { resolveProfileSaveErrorMessage } from "../utils/concurrency";
import { isSudoCancelledError } from "../utils/sudoElevation";
import type {
  SendEmailVerificationPayload,
  SendEmailVerificationResponse,
} from "../../domain/interfaces/ISovereignAccountRepository";
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
  onSendOtp?: (
    payload?: SendEmailVerificationPayload
  ) => Promise<SendEmailVerificationResponse | unknown>;
  /** Optional override for Step 1 Sudo verification (defaults to `useSudoViewModel`). */
  onVerifyStepUp?: (params: {
    method: IdentityStepUpMethod;
    credential?: string;
  }) => Promise<unknown>;
  /** Commits the identity identifier update with verified OTP code. */
  onCommitChange: (mode: "email" | "username", newValue: string, otpCode: string) => Promise<void>;
}

/**
 * 3-step verification wizard for updating primary account email or username
 * behind cryptographic Sudo step-up authentication and OTP confirmation.
 */
export function IdentityChangeVerificationModal({
  open,
  mode,
  currentValue,
  onOpenChange,
  onSendOtp,
  onVerifyStepUp,
  onCommitChange,
}: IdentityChangeVerificationModalProps) {
  const { t } = useI18n();
  const availableMethods = useSudoStore((s) => s.availableMethods);
  const mandatoryFactorPolicy = useSudoStore((s) => s.mandatoryFactorPolicy);
  const allowsPasswordFallback = useSudoStore((s) => s.allowsPasswordFallback);
  const { refreshStatus, verifyWithPasskey, verifyWithTotp, verifyWithPassword } =
    useSudoViewModel();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sudoMethod, setSudoMethod] = useState<IdentityStepUpMethod>("totp");
  const [sudoCredential, setSudoCredential] = useState("");
  const [newValue, setNewValue] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const isEmail = mode === "email";

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && !onVerifyStepUp) {
      setIsLoadingStatus(true);
      setStepError(null);
    }
  }

  useEffect(() => {
    if (!open || onVerifyStepUp) return;
    let active = true;
    refreshStatus().finally(() => {
      if (active) setIsLoadingStatus(false);
    });
    return () => {
      active = false;
    };
  }, [open, onVerifyStepUp, refreshStatus]);

  const allowedFactors = onVerifyStepUp
    ? (["totp", "passkey", "password"] as IdentityStepUpMethod[])
    : computeAllowedFactors(mandatoryFactorPolicy, availableMethods, allowsPasswordFallback);

  const effectiveMethod: IdentityStepUpMethod = allowedFactors.includes(sudoMethod)
    ? sudoMethod
    : (allowedFactors[0] ?? "totp");

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep(1);
      setNewValue("");
      setSudoCredential("");
      setOtpCode("");
      setStepError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleStep1Continue = async () => {
    if (allowedFactors.length === 0) {
      setStepError(t("profile.identityModal.noSudoFactorsError"));
      return;
    }
    if (effectiveMethod !== "passkey" && !sudoCredential.trim()) return;

    setStepError(null);
    setIsSubmitting(true);
    try {
      if (onVerifyStepUp) {
        await onVerifyStepUp({
          method: effectiveMethod,
          credential: sudoCredential.trim() || undefined,
        });
      } else if (effectiveMethod === "passkey") {
        await verifyWithPasskey();
      } else if (effectiveMethod === "totp") {
        await verifyWithTotp(sudoCredential.trim());
      } else {
        await verifyWithPassword(sudoCredential);
      }
      setSudoCredential("");
      setStep(2);
    } catch (err: unknown) {
      setStepError(resolveSudoErrorMessage(err, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2DispatchOtp = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    const cleanValue = isEmail ? trimmed : trimmed.replace(/^@/, "");
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
      setStepError(t("profile.identityModal.invalidEmailError"));
      return;
    }
    if (!isEmail && cleanValue.length < 3) {
      setStepError(t("profile.identityModal.invalidUsernameError"));
      return;
    }

    setStepError(null);
    setIsSubmitting(true);
    try {
      const res = (await onSendOtp?.({
        targetEmail: isEmail ? cleanValue : undefined,
        mode,
      })) as SendEmailVerificationResponse | undefined;

      if (res && (res.sent === false || res.success === false)) {
        setStepError(res.message?.trim() || t("profile.identityModal.otpSendFailedError"));
        return;
      }
      setStep(3);
    } catch (err: unknown) {
      if (isSudoCancelledError(err)) return;
      setStepError(resolveProfileSaveErrorMessage(err, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Commit = async () => {
    const trimmed = newValue.trim();
    const cleanOtp = otpCode.trim();
    if (!trimmed || cleanOtp.length < 6) return;
    const cleanValue = isEmail ? trimmed : trimmed.replace(/^@/, "");

    setStepError(null);
    setIsSubmitting(true);
    try {
      await onCommitChange(mode, cleanValue, cleanOtp);
      handleClose(false);
    } catch (err: unknown) {
      if (isSudoCancelledError(err)) return;
      setStepError(resolveProfileSaveErrorMessage(err, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const step1Disabled =
    isSubmitting ||
    isLoadingStatus ||
    allowedFactors.length === 0 ||
    (effectiveMethod !== "passkey" && !sudoCredential.trim());

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

        {step === 1 &&
          (isLoadingStatus ? (
            <div className="space-y-3 py-2" data-testid="identity-step1-loading">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : allowedFactors.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription className="text-xs">
                {t("profile.identityModal.noSudoFactorsError")}
              </AlertDescription>
            </Alert>
          ) : (
            <IdentityChangeStep1
              currentValue={currentValue}
              sudoMethod={effectiveMethod}
              allowedMethods={allowedFactors}
              sudoCredential={sudoCredential}
              isSubmitting={isSubmitting}
              onMethodChange={(nextMethod) => {
                setSudoMethod(nextMethod);
                setSudoCredential("");
                setStepError(null);
              }}
              onCredentialChange={(val) => {
                setSudoCredential(val);
                if (stepError) setStepError(null);
              }}
            />
          ))}

        {step === 2 && (
          <IdentityChangeStep2
            isEmail={isEmail}
            newValue={newValue}
            onNewValueChange={(val) => {
              setNewValue(val);
              if (stepError) setStepError(null);
            }}
          />
        )}

        {step === 3 && (
          <IdentityChangeStep3
            newValue={newValue}
            otpCode={otpCode}
            onOtpCodeChange={(val) => {
              setOtpCode(val);
              if (stepError) setStepError(null);
            }}
          />
        )}

        {stepError && (
          <Alert variant="destructive" data-testid="identity-modal-error">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs">{stepError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex items-center justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleClose(false)}
          >
            {t("profile.cancel")}
          </Button>

          {step === 1 && (
            <Button
              type="button"
              size="sm"
              data-testid="identity-step-1-next-btn"
              disabled={step1Disabled}
              loading={isSubmitting}
              onClick={() => void handleStep1Continue()}
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
              loading={isSubmitting}
              onClick={() => void handleStep2DispatchOtp()}
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
              loading={isSubmitting}
              onClick={() => void handleStep3Commit()}
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
