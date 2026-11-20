"use client";

import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Loader2 } from "lucide-react";

/**
 * Props for RevokeOtherSessionsDialog.
 */
export interface RevokeOtherSessionsDialogProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  open: boolean;
  otherCount: number;
  isRevokingAllOthers: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Sudo-gated confirmation modal for revoking every other active workstation session.
 */
export function RevokeOtherSessionsDialog({
  t,
  open,
  otherCount,
  isRevokingAllOthers,
  error,
  onOpenChange,
  onConfirm,
}: RevokeOtherSessionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-nx-surface border-nx-line p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("profile.sessions.revokeAllConfirmTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-3">
            {t("profile.sessions.revokeAllConfirmDesc", { count: otherCount })}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-xs text-destructive font-medium">{error}</p>}

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isRevokingAllOthers}
            className="text-xs"
          >
            {t("profile.common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            data-testid="confirm-revoke-all-sessions-btn"
            onClick={onConfirm}
            disabled={isRevokingAllOthers}
            className="text-xs font-semibold gap-1.5"
          >
            {isRevokingAllOthers && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{t("profile.sessions.revokeAllOthersBtn")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
