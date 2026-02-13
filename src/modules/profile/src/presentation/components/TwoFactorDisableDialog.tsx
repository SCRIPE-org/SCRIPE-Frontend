"use client";

/**
 * TwoFactorDisableDialog
 *
 * 2-step confirmation dialog to disable 2FA:
 * Step 1 — Enter current password
 * Step 2 — Enter TOTP code or backup code
 */
import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@core/ui/input-otp";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ShieldX, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";

type DisableStep = "password" | "verify";

interface TwoFactorDisableDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onDisable: (password: string, twoFactorCode: string) => Promise<void>;
      isDisabling: boolean;
      disableError: string | null;
}

export function TwoFactorDisableDialog({
      open,
      onOpenChange,
      onDisable,
      isDisabling,
      disableError,
}: TwoFactorDisableDialogProps) {
      const { t } = useI18n();
      const [step, setStep] = useState<DisableStep>("password");
      const [password, setPassword] = useState("");
      const [showPassword, setShowPassword] = useState(false);
      const [twoFactorCode, setTwoFactorCode] = useState("");
      const [useBackupCode, setUseBackupCode] = useState(false);
      const [error, setError] = useState("");

      const handleNextStep = useCallback(() => {
            if (!password.trim()) {
                  setError(t("profile.security.twoFactor.disable.passwordRequired"));
                  return;
            }
            setError("");
            setStep("verify");
      }, [password, t]);

      const handleDisable = useCallback(async () => {
            const code = twoFactorCode.trim();
            if (!code) {
                  setError(t("auth.twoFactor.enterCode"));
                  return;
            }
            setError("");
            try {
                  await onDisable(password, code);
                  // Reset on success (dialog will close via parent)
                  setPassword("");
                  setTwoFactorCode("");
                  setStep("password");
                  setError("");
            } catch (err) {
                  setError(
                        err instanceof Error
                              ? err.message
                              : t("profile.security.twoFactor.disable.failed")
                  );
            }
      }, [password, twoFactorCode, onDisable, t]);

      const handleClose = useCallback(
            (isOpen: boolean) => {
                  if (!isOpen) {
                        setStep("password");
                        setPassword("");
                        setShowPassword(false);
                        setTwoFactorCode("");
                        setUseBackupCode(false);
                        setError("");
                  }
                  onOpenChange(isOpen);
            },
            [onOpenChange]
      );

      return (
            <Dialog open={open} onOpenChange={handleClose}>
                  <DialogContent className="sm:max-w-md">
                        {/* Step 1: Password */}
                        {step === "password" && (
                              <>
                                    <DialogHeader>
                                          <div className="flex items-center gap-2">
                                                <ShieldX className="h-5 w-5 text-destructive" />
                                                <DialogTitle>
                                                      {t("profile.security.twoFactor.disable.title")}
                                                </DialogTitle>
                                          </div>
                                          <DialogDescription>
                                                {t("profile.security.twoFactor.disable.description")}
                                          </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-4 space-y-4">
                                          {error && (
                                                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
                                                      <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold">!</span>
                                                      </div>
                                                      <span>{error}</span>
                                                </div>
                                          )}

                                          <div className="space-y-2">
                                                <Label htmlFor="disable-2fa-password">
                                                      {t("profile.security.twoFactor.disable.passwordLabel")}
                                                </Label>
                                                <div className="relative">
                                                      <Input
                                                            id="disable-2fa-password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            className="h-12 pe-12"
                                                            disabled={isDisabling}
                                                            onKeyDown={(e) => {
                                                                  if (e.key === "Enter" && password.trim()) {
                                                                        handleNextStep();
                                                                  }
                                                            }}
                                                            autoFocus
                                                      />
                                                      <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute end-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            disabled={isDisabling}
                                                      >
                                                            {showPassword ? (
                                                                  <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                  <Eye className="h-4 w-4" />
                                                            )}
                                                      </Button>
                                                </div>
                                          </div>
                                    </div>

                                    <DialogFooter>
                                          <Button
                                                variant="outline"
                                                onClick={() => handleClose(false)}
                                          >
                                                {t("common.cancel")}
                                          </Button>
                                          <Button
                                                variant="destructive"
                                                onClick={handleNextStep}
                                                disabled={!password.trim()}
                                          >
                                                {t("common.next")}
                                          </Button>
                                    </DialogFooter>
                              </>
                        )}

                        {/* Step 2: Verify OTP / Backup Code */}
                        {step === "verify" && (
                              <>
                                    <DialogHeader>
                                          <div className="flex items-center gap-2">
                                                <ShieldX className="h-5 w-5 text-destructive" />
                                                <DialogTitle>
                                                      {t("profile.security.twoFactor.disable.verifyTitle")}
                                                </DialogTitle>
                                          </div>
                                          <DialogDescription>
                                                {useBackupCode
                                                      ? t("profile.security.twoFactor.disable.enterBackupCode")
                                                      : t("profile.security.twoFactor.disable.enterOtp")}
                                          </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-4 space-y-4">
                                          {(error || disableError) && (
                                                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
                                                      <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold">!</span>
                                                      </div>
                                                      <span>{error || disableError}</span>
                                                </div>
                                          )}

                                          {useBackupCode ? (
                                                <div className="space-y-3">
                                                      <Label htmlFor="disable-backup-code" className="text-sm font-medium">
                                                            {t("auth.twoFactor.backupCode")}
                                                      </Label>
                                                      <Input
                                                            id="disable-backup-code"
                                                            type="text"
                                                            value={twoFactorCode}
                                                            onChange={(e) => setTwoFactorCode(e.target.value)}
                                                            placeholder="XXXX-XXXX"
                                                            className="h-14 text-center text-lg font-mono tracking-[0.3em] border-2 focus:border-primary/50 transition-colors"
                                                            style={{ direction: "ltr" }}
                                                            disabled={isDisabling}
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                  if (e.key === "Enter" && twoFactorCode.trim()) {
                                                                        handleDisable();
                                                                  }
                                                            }}
                                                      />
                                                </div>
                                          ) : (
                                                <div className="flex flex-col items-center gap-2" dir="ltr">
                                                      <InputOTP
                                                            maxLength={6}
                                                            value={twoFactorCode}
                                                            onChange={setTwoFactorCode}
                                                            disabled={isDisabling}
                                                            onComplete={handleDisable}
                                                            className="gap-2"
                                                      >
                                                            <InputOTPGroup className="gap-1.5">
                                                                  <InputOTPSlot index={0} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                                                                  <InputOTPSlot index={1} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                                                                  <InputOTPSlot index={2} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                                                            </InputOTPGroup>
                                                            <span className="text-xl font-light text-muted-foreground/50 mx-1">–</span>
                                                            <InputOTPGroup className="gap-1.5">
                                                                  <InputOTPSlot index={3} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                                                                  <InputOTPSlot index={4} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                                                                  <InputOTPSlot index={5} className="h-14 w-12 text-xl font-semibold border-2 rounded-xl transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20" />
                                                            </InputOTPGroup>
                                                      </InputOTP>
                                                </div>
                                          )}

                                          {/* Toggle TOTP / Backup Code */}
                                          <div className="text-center pt-1">
                                                <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                                      onClick={() => {
                                                            setUseBackupCode(!useBackupCode);
                                                            setTwoFactorCode("");
                                                            setError("");
                                                      }}
                                                >
                                                      <KeyRound className="h-3.5 w-3.5 me-2" />
                                                      {useBackupCode
                                                            ? t("auth.twoFactor.useAuthenticator")
                                                            : t("auth.twoFactor.useBackupCode")}
                                                </Button>
                                          </div>
                                    </div>

                                    <DialogFooter>
                                          <Button
                                                variant="outline"
                                                onClick={() => {
                                                      setStep("password");
                                                      setTwoFactorCode("");
                                                      setError("");
                                                }}
                                                disabled={isDisabling}
                                          >
                                                <ArrowLeft className="h-3.5 w-3.5 me-1.5" />
                                                {t("common.back")}
                                          </Button>
                                          <Button
                                                variant="destructive"
                                                onClick={handleDisable}
                                                disabled={isDisabling || !twoFactorCode.trim()}
                                          >
                                                {isDisabling ? (
                                                      <div className="flex items-center gap-2">
                                                            <LoadingSpinner size="inline" showText={false} />
                                                            <span>{t("common.loading")}</span>
                                                      </div>
                                                ) : (
                                                      t("profile.security.twoFactor.disable.confirm")
                                                )}
                                          </Button>
                                    </DialogFooter>
                              </>
                        )}
                  </DialogContent>
            </Dialog>
      );
}
