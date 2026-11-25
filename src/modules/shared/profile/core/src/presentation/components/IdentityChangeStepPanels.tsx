"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { ShieldCheck, KeyRound, Fingerprint, CheckCircle2 } from "lucide-react";

/** Step-up credential verification mode supported during identity change. */
export type IdentityStepUpMethod = "totp" | "passkey" | "password";

const ALL_METHODS: IdentityStepUpMethod[] = ["totp", "passkey", "password"];

/** Renders the 3-step visual progress indicator bar for identity change verification. */
export function IdentityChangeStepProgress({ step }: { step: 1 | 2 | 3 }) {
  const { t } = useI18n();
  const steps = [
    { num: 1, label: t("profile.identityModal.step1Short") },
    { num: 2, label: t("profile.identityModal.step2Short") },
    { num: 3, label: t("profile.identityModal.step3Short") },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 py-2" data-testid="identity-modal-steps">
      {steps.map((item) => {
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
  );
}

/** Props for {@link IdentityChangeStep1}. */
export interface IdentityChangeStep1Props {
  /** Current email or username value before mutation. */
  currentValue: string;
  /** Selected step-up verification factor. */
  sudoMethod: IdentityStepUpMethod;
  /** Allowed step-up factors under the active sudo policy. */
  allowedMethods?: IdentityStepUpMethod[];
  /** Controlled credential input for TOTP or password. */
  sudoCredential: string;
  /** True while step-up verification is in flight. */
  isSubmitting?: boolean;
  /** Switches the step-up verification method. */
  onMethodChange: (method: IdentityStepUpMethod) => void;
  /** Updates the step-up credential input. */
  onCredentialChange: (value: string) => void;
}

/** Step 1 panel for authenticating current operator identity via TOTP, Passkey, or Password. */
export function IdentityChangeStep1({
  currentValue,
  sudoMethod,
  allowedMethods,
  sudoCredential,
  isSubmitting = false,
  onMethodChange,
  onCredentialChange,
}: IdentityChangeStep1Props) {
  const { t } = useI18n();
  const methodsToShow = allowedMethods && allowedMethods.length > 0 ? allowedMethods : ALL_METHODS;

  return (
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
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${methodsToShow.length}, minmax(0, 1fr))` }}
        >
          {methodsToShow.map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              data-testid={`identity-stepup-method-${m}`}
              disabled={isSubmitting}
              variant={sudoMethod === m ? "default" : "outline"}
              onClick={() => onMethodChange(m)}
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

      {sudoMethod === "passkey" ? (
        <div
          data-testid="identity-step1-passkey-panel"
          className="rounded-lg border border-nx-line bg-nx-ground p-4 flex items-center gap-3"
        >
          <div className="h-9 w-9 rounded-lg bg-nx-accent-wash border border-nx-accent/30 text-nx-accent flex items-center justify-center shrink-0">
            <Fingerprint className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.identityModal.passkeyReadyLabel")}
            </p>
            <p className="text-[11px] text-nx-ink-3 leading-relaxed">
              {t("profile.identityModal.passkeyStepUpDesc")}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="stepup-credential-input" className="text-xs text-nx-ink-2">
            {sudoMethod === "totp"
              ? t("profile.identityModal.enterTotpLabel")
              : t("profile.identityModal.enterPasswordLabel")}
          </Label>
          <Input
            id="stepup-credential-input"
            data-testid="stepup-credential-input"
            type={sudoMethod === "password" ? "password" : "text"}
            inputMode={sudoMethod === "totp" ? "numeric" : undefined}
            autoComplete={sudoMethod === "password" ? "current-password" : "one-time-code"}
            maxLength={sudoMethod === "totp" ? 8 : undefined}
            disabled={isSubmitting}
            value={sudoCredential}
            onChange={(e) => onCredentialChange(e.target.value)}
            className="font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}

/** Props for {@link IdentityChangeStep2}. */
export interface IdentityChangeStep2Props {
  /** True when updating email; false when updating username. */
  isEmail: boolean;
  /** Controlled replacement identifier value. */
  newValue: string;
  /** Updates the candidate new identifier input. */
  onNewValueChange: (value: string) => void;
}

/** Step 2 panel for entering the replacement email/username prior to OTP dispatch. */
export function IdentityChangeStep2({
  isEmail,
  newValue,
  onNewValueChange,
}: IdentityChangeStep2Props) {
  const { t } = useI18n();

  return (
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
          dir="ltr"
          value={newValue}
          onChange={(e) => onNewValueChange(e.target.value)}
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
  );
}

/** Props for {@link IdentityChangeStep3}. */
export interface IdentityChangeStep3Props {
  /** Target email or username that received the verification OTP. */
  newValue: string;
  /** Controlled 6-digit OTP verification code. */
  otpCode: string;
  /** Updates the 6-digit OTP code input. */
  onOtpCodeChange: (value: string) => void;
}

/** Step 3 panel for submitting the 6-digit verification OTP to commit the change. */
export function IdentityChangeStep3({
  newValue,
  otpCode,
  onOtpCodeChange,
}: IdentityChangeStep3Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 py-1" data-testid="identity-step-3">
      <div className="rounded-lg border border-nx-accent/30 bg-nx-accent-wash p-3">
        <p className="text-[11px] text-nx-ink-2">
          {t("profile.identityModal.otpSentNotice", { target: newValue })}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="identity-otp-input"
          className="text-xs font-semibold text-nx-ink flex items-center gap-1.5"
        >
          <KeyRound className="h-3.5 w-3.5 text-nx-accent" style={{ minWidth: 14, minHeight: 14 }} />
          <span>{t("profile.identityModal.otpCodeLabel")}</span>
        </Label>
        <Input
          id="identity-otp-input"
          data-testid="identity-otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          dir="ltr"
          maxLength={6}
          value={otpCode}
          onChange={(e) => onOtpCodeChange(e.target.value)}
          placeholder="000000"
          className="font-mono text-sm tracking-widest text-center font-bold"
        />
        <p className="text-[11px] text-nx-ink-3">
          {t("profile.identityModal.otpExpiryNotice")}
        </p>
      </div>
    </div>
  );
}
