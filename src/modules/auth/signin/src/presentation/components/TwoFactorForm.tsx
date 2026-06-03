"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ShieldCheck, KeyRound, ArrowLeft, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";

interface TwoFactorFormProps {
  twoFactorCode: string;
  setTwoFactorCode: (code: string) => void;
  useBackupCode: boolean;
  isVerifying2FA: boolean;
  error: string;
  isRTL: boolean;
  handleVerify2FA: () => void;
  toggleBackupCode: () => void;
  goBackToCredentials: () => void;
}

export function TwoFactorForm({
  twoFactorCode,
  setTwoFactorCode,
  useBackupCode,
  isVerifying2FA,
  error,
  isRTL,
  handleVerify2FA,
  toggleBackupCode,
  goBackToCredentials,
}: TwoFactorFormProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Icon & heading ──────────────────────────────── */}
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "var(--sx-accent-soft, rgba(168,85,247,.1))",
            border: "1px solid var(--sx-accent-soft-border, rgba(168,85,247,.3))",
          }}
        >
          <ShieldCheck
            className="h-7 w-7"
            style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
          />
        </div>
        <h2
          className="text-[22px] font-semibold leading-tight tracking-[-0.025em]"
          style={{ color: "var(--sx-text, hsl(var(--foreground)))" }}
        >
          {t("auth.twoFactor.title")}
        </h2>
        <p
          className="mt-1.5 text-[13px] leading-relaxed"
          style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
        >
          {useBackupCode
            ? t("auth.twoFactor.enterBackupCode")
            : t("auth.twoFactor.enterAuthCode")}
        </p>
      </div>

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <p className="text-center text-[13px] font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* ── OTP input or backup code ─────────────────────── */}
      {useBackupCode ? (
        <div className="space-y-2">
          <Label
            htmlFor="backup-code"
            className="block text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
          >
            {t("auth.twoFactor.backupCode")}
          </Label>
          <Input
            id="backup-code"
            type="text"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="XXXX-XXXX"
            className="h-14 rounded-xl border text-center font-mono text-lg tracking-[0.25em] shadow-none transition-all"
            style={{ direction: "ltr" }}
            disabled={isVerifying2FA}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && twoFactorCode.trim()) handleVerify2FA();
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3" dir="ltr">
          <InputOTP
            maxLength={6}
            value={twoFactorCode}
            onChange={setTwoFactorCode}
            disabled={isVerifying2FA}
            onComplete={handleVerify2FA}
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-11 rounded-xl border text-xl font-semibold shadow-none transition-all"
                  style={{
                    background: "var(--sx-chip-bg, rgba(255,255,255,.03))",
                    borderColor: "var(--sx-chip-border, rgba(255,255,255,.08))",
                    color: "var(--sx-text, hsl(var(--foreground)))",
                  }}
                />
              ))}
            </InputOTPGroup>
            <span
              className="mx-2 text-xl font-light"
              style={{ color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.4))" }}
            >
              –
            </span>
            <InputOTPGroup className="gap-2">
              {[3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-11 rounded-xl border text-xl font-semibold shadow-none transition-all"
                  style={{
                    background: "var(--sx-chip-bg, rgba(255,255,255,.03))",
                    borderColor: "var(--sx-chip-border, rgba(255,255,255,.08))",
                    color: "var(--sx-text, hsl(var(--foreground)))",
                  }}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p
            className="text-[12px]"
            style={{ color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.5))" }}
          >
            {t("auth.twoFactor.autoSubmitHint")}
          </p>
        </div>
      )}

      {/* ── Verify button ────────────────────────────────── */}
      <Button
        type="button"
        disabled={isVerifying2FA || !twoFactorCode.trim()}
        onClick={handleVerify2FA}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-[15px] font-semibold text-white shadow-none transition-all active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
      >
        {isVerifying2FA ? (
          <>
            <span
              className="sx-spin1 inline-block h-[18px] w-[18px] rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            />
            {t("auth.twoFactor.verifying")}
          </>
        ) : (
          <>{t("auth.twoFactor.verify")}</>
        )}
      </Button>

      {/* ── Secondary actions ─────────────────────────────── */}
      <div
        className="flex flex-col items-center gap-2 border-t pt-4"
        style={{ borderColor: "var(--sx-chip-border, hsl(var(--border)))" }}
      >
        <Button
          variant="ghost"
          type="button"
          className="flex items-center gap-2 text-[13px] font-medium transition-colors"
          style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
          onClick={toggleBackupCode}
        >
          <KeyRound
            className="h-3.5 w-3.5"
            style={{ color: "var(--sx-accent-text, hsl(var(--primary)))" }}
            aria-hidden="true"
          />
          {useBackupCode
            ? t("auth.twoFactor.useAuthenticator")
            : t("auth.twoFactor.useBackupCode")}
        </Button>

        <Button
          variant="ghost"
          type="button"
          className="flex items-center gap-1.5 text-[12px] transition-colors disabled:pointer-events-none disabled:opacity-50"
          style={{ color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.6))" }}
          onClick={goBackToCredentials}
          disabled={isVerifying2FA}
        >
          {isRTL ? (
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          )}
          {t("auth.twoFactor.backToLogin")}
        </Button>
      </div>
    </div>
  );
}
