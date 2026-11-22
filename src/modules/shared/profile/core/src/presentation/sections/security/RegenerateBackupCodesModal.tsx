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
import { Copy, Download, Loader2 } from "lucide-react";

/**
 * Props for RegenerateBackupCodesModal.
 */
export interface RegenerateBackupCodesModalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  submitError: string | null;
  onRegenerate: (code: string) => Promise<string[]>;
}

/**
 * Dialog for TOTP verification, regenerating backup recovery codes, and copying/downloading them.
 */
export function RegenerateBackupCodesModal({
  t,
  open,
  onOpenChange,
  isSubmitting,
  submitError,
  onRegenerate,
}: RegenerateBackupCodesModalProps) {
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCode("");
      setLocalError(null);
      setGeneratedCodes(null);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setLocalError(t("profile.security.twoFactor.setup.invalidCode"));
      return;
    }
    setLocalError(null);
    try {
      const codes = await onRegenerate(code.trim());
      setGeneratedCodes(Array.isArray(codes) ? codes : []);
      setCode("");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  const handleCopyBackupCodes = async () => {
    if (!generatedCodes || generatedCodes.length === 0) return;
    await navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast.success(t("profile.common.copied"));
  };

  const handleDownloadBackupCodes = () => {
    if (!generatedCodes || generatedCodes.length === 0) return;
    const blob = new Blob([generatedCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scripe-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const visibleError = localError || submitError;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-nx-line bg-nx-surface text-nx-ink">
        {!generatedCodes ? (
          <form onSubmit={(e) => void handleConfirm(e)}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-nx-ink">
                {t("profile.security.backupCodes.regenerateTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("profile.security.backupCodes.regenerateDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="regen-codes-totp" className="text-xs font-medium text-nx-ink">
                  {t("profile.security.backupCodes.disableTotpLabel")}
                </Label>
                <Input
                  id="regen-codes-totp"
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
                size="sm"
                disabled={isSubmitting || !code.trim()}
                className="bg-nx-accent-fill text-nx-on-fill font-semibold gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{t("profile.security.backupCodes.regenerateConfirmBtn")}</span>
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-nx-ink">
                {t("profile.security.backupCodes.regenerateSuccessTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("profile.security.backupCodes.regenerateSuccessDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-nx-line bg-nx-raised font-mono text-xs text-nx-ink">
              {generatedCodes.map((entry) => (
                <div
                  key={entry}
                  className="px-2 py-1 rounded bg-nx-surface border border-nx-line text-center"
                >
                  {entry}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-2.5 text-xs text-warning">
              {t("profile.security.twoFactor.setup.backupWarning")}
            </div>
            <DialogFooter className="gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleCopyBackupCodes()}
                className="border-nx-line text-nx-ink gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{t("profile.security.twoFactor.setup.copyCodes")}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadBackupCodes}
                className="border-nx-line text-nx-ink gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t("profile.security.twoFactor.setup.download")}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleOpenChange(false)}
                className="bg-nx-accent-fill text-nx-on-fill font-semibold"
              >
                {t("profile.common.close", { defaultValue: "Close" })}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
