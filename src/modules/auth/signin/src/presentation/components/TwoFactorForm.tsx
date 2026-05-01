"use client";
import { useI18n } from "@core/providers/i18n-provider";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ShieldCheck, KeyRound, ArrowLeft, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
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
    <div className="space-y-7">
      {/* Icon & Title */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("auth.twoFactor.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {useBackupCode ? t("auth.twoFactor.enterBackupCode") : t("auth.twoFactor.enterAuthCode")}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-center text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Input */}
      {useBackupCode ? (
        <div className="space-y-2.5">
          <Label htmlFor="backup-code" className="text-sm font-medium text-foreground">
            {t("auth.twoFactor.backupCode")}
          </Label>
          <Input
            id="backup-code"
            type="text"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            placeholder="XXXX-XXXX"
            className="h-14 rounded-xl border-border bg-background text-center font-mono text-lg tracking-[0.25em] text-foreground shadow-sm transition-all focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            style={{ direction: "ltr" }}
            disabled={isVerifying2FA}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && twoFactorCode.trim()) handleVerify2FA();
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2" dir="ltr">
          <InputOTP
            maxLength={6}
            value={twoFactorCode}
            onChange={setTwoFactorCode}
            disabled={isVerifying2FA}
            onComplete={handleVerify2FA}
          >
            <InputOTPGroup className="gap-2.5">
              {[0, 1, 2].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 rounded-xl border-border bg-background text-xl font-semibold text-foreground shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
                />
              ))}
            </InputOTPGroup>
            <span className="mx-2 text-xl font-light text-muted-foreground/50">–</span>
            <InputOTPGroup className="gap-2.5">
              {[3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 rounded-xl border-border bg-background text-xl font-semibold text-foreground shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      )}

      {/* Verify Button */}
      <Button
        type="button"
        disabled={isVerifying2FA || !twoFactorCode.trim()}
        onClick={handleVerify2FA}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {isVerifying2FA ? (
          <>
            <LoadingSpinner size="sm" showText={false} className="ltr:mr-2 rtl:ml-2" />
            {t("auth.twoFactor.verifying")}
          </>
        ) : (
          <>{t("auth.twoFactor.verify")}</>
        )}
      </Button>

      {/* Actions */}
      <div className="flex flex-col items-center gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          onClick={toggleBackupCode}
        >
          <KeyRound className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {useBackupCode ? t("auth.twoFactor.useAuthenticator") : t("auth.twoFactor.useBackupCode")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          onClick={goBackToCredentials}
          disabled={isVerifying2FA}
        >
          {isRTL ? (
            <ArrowRight className="ml-1.5 h-3 w-3" />
          ) : (
            <ArrowLeft className="mr-1.5 h-3 w-3" />
          )}
          {t("auth.twoFactor.backToLogin")}
        </Button>
      </div>
    </div>
  );
}
