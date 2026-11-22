"use client";

/**
 * EmergencyLockdownDialog
 *
 * 1-Click Nuclear Session Kill & Account Shield.
 * Immediately invalidates all active sessions across all devices, wipes client auth tokens,
 * and forces immediate re-authentication. Requires typing "LOCKDOWN" to execute.
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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { ShieldAlert, AlertTriangle, Loader2 } from "lucide-react";

/** Props for {@link EmergencyLockdownDialog}. */
interface EmergencyLockdownDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLockdown: () => Promise<unknown>;
  isLockingDown: boolean;
}

/** Confirmation modal requiring `"LOCKDOWN"` keyword before executing full emergency session kill. */
export function EmergencyLockdownDialog({
  isOpen,
  onClose,
  onConfirmLockdown,
  isLockingDown,
}: EmergencyLockdownDialogProps) {
  const { t } = useI18n();
  const [confirmKeyword, setConfirmKeyword] = useState("");
  const requiredKeyword = "LOCKDOWN";

  const handleExecute = async () => {
    if (confirmKeyword !== requiredKeyword) return;
    try {
      await onConfirmLockdown();
    } catch {}
  };

  const handleClose = () => {
    setConfirmKeyword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px] bg-nx-surface border-destructive/50 p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-9 w-9 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
            </div>
            <DialogTitle className="text-base font-bold text-destructive">
              {t("profile.lockdown.dialogTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-nx-ink-3">
            {t("profile.lockdown.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t("profile.lockdown.warningTitle")}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-destructive/90">
              {t("profile.lockdown.warningText")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lockdown-confirm" className="text-xs font-semibold text-nx-ink">
              {t("profile.lockdown.typePrompt")} <span className="font-mono text-destructive">{requiredKeyword}</span>:
            </Label>
            <Input
              id="lockdown-confirm"
              value={confirmKeyword}
              onChange={(e) => setConfirmKeyword(e.target.value)}
              placeholder={requiredKeyword}
              className="font-mono text-xs uppercase bg-nx-surface border-nx-line text-nx-ink"
              disabled={isLockingDown}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isLockingDown}
            className="text-xs"
          >
            {t("profile.common.cancel")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleExecute}
            disabled={isLockingDown || confirmKeyword !== requiredKeyword}
            className="text-xs font-semibold gap-1.5"
          >
            {isLockingDown && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t("profile.lockdown.executeBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
