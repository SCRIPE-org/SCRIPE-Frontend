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
import type { GovernanceDelegationItem } from "./GovernanceDelegationsSection";
import { Loader2 } from "lucide-react";

/**
 * Props for RevokeDelegationModal.
 */
export interface RevokeDelegationModalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  pendingRevoke: GovernanceDelegationItem | null;
  revokeError: string | null;
  isRevokingDelegation: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Sudo-gated confirmation dialog for revoking an active access delegation.
 */
export function RevokeDelegationModal({
  t,
  pendingRevoke,
  revokeError,
  isRevokingDelegation,
  onClose,
  onConfirm,
}: RevokeDelegationModalProps) {
  return (
    <Dialog
      open={Boolean(pendingRevoke)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[440px] bg-nx-surface border-nx-line p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("profile.governance.revokeConfirmTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-3">
            {t("profile.governance.revokeConfirmDesc", {
              name: pendingRevoke?.delegateDisplayName || pendingRevoke?.delegateEmail || "",
            })}
          </DialogDescription>
        </DialogHeader>

        {revokeError && <p className="text-xs text-destructive font-medium">{revokeError}</p>}

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isRevokingDelegation}
            className="text-xs"
          >
            {t("profile.common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            data-testid="confirm-revoke-delegation-btn"
            onClick={onConfirm}
            disabled={isRevokingDelegation}
            className="text-xs font-semibold gap-1.5"
          >
            {isRevokingDelegation && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{t("profile.governance.revokeDelegationBtn")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
