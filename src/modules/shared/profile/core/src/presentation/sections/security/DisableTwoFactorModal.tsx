"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { toast } from "@core/ui/sileo-toast";
import { Loader2 } from "lucide-react";

/**
 * Props for DisableTwoFactorModal.
 */
export interface DisableTwoFactorModalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: (payload: { password: string; code: string }) => Promise<void>;
}

/**
 * Verification dialog for disabling TOTP two-factor authentication using password and 2FA code.
 */
export function DisableTwoFactorModal({
  t,
  open,
  onOpenChange,
  isSubmitting,
  submitError,
  onSubmit,
}: DisableTwoFactorModalProps) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setPassword("");
    setCode("");
    setLocalError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLocalError(t("profile.security.twoFactor.disable.passwordRequired"));
      return;
    }
    if (!code.trim()) {
      setLocalError(t("profile.security.twoFactor.setup.invalidCode"));
      return;
    }
    setLocalError(null);
    try {
      await onSubmit({ password, code: code.trim() });
      toast.success(t("profile.security.backupCodes.disabledSuccess"));
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("profile.security.twoFactor.disable.failed"));
    }
  };

  const visibleError = localError || submitError;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-nx-line bg-nx-surface text-nx-ink">
        <form onSubmit={(e) => void handleConfirm(e)}>
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-destructive">
              {t("profile.security.backupCodes.disableTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("profile.security.backupCodes.disableDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="disable-2fa-password" className="text-xs font-medium text-nx-ink">
                {t("profile.security.backupCodes.disablePasswordLabel")}
              </Label>
              <Input
                id="disable-2fa-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("profile.security.backupCodes.disablePasswordPlaceholder")}
                required
                className="bg-nx-raised border-nx-line text-nx-ink"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disable-2fa-code" className="text-xs font-medium text-nx-ink">
                {t("profile.security.backupCodes.disableTotpLabel")}
              </Label>
              <Input
                id="disable-2fa-code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={12}
                required
                className="bg-nx-raised border-nx-line text-nx-ink font-mono tracking-widest"
              />
            </div>
            {visibleError && (
              <p className="text-xs text-destructive" role="alert">
                {visibleError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              className="border-nx-line text-nx-ink-2"
            >
              {t("profile.common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              className="font-semibold gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{t("profile.security.backupCodes.disableConfirmBtn")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
