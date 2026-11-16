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
import type { PersonalAccessToken } from "../../viewmodels/useIntegrationsFederationViewModel";
import { Loader2 } from "lucide-react";

/**
 * Props for PatSecretAndConfirmModals.
 */
export interface PatSecretAndConfirmModalsProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  pendingRollToken: PersonalAccessToken | null;
  pendingRevokeToken: PersonalAccessToken | null;
  isRollingToken: boolean;
  isRevokingToken: boolean;
  actionError: string | null;
  onCloseRoll: () => void;
  onConfirmRoll: () => void;
  onCloseRevoke: () => void;
  onConfirmRevoke: () => void;
}

/**
 * Sudo-gated Roll Secret and Revoke Personal Access Token confirmation dialogs.
 */
export function PatSecretAndConfirmModals({
  t,
  pendingRollToken,
  pendingRevokeToken,
  isRollingToken,
  isRevokingToken,
  actionError,
  onCloseRoll,
  onConfirmRoll,
  onCloseRevoke,
  onConfirmRevoke,
}: PatSecretAndConfirmModalsProps) {
  return (
    <>
      <Dialog
        open={Boolean(pendingRollToken)}
        onOpenChange={(open) => {
          if (!open) onCloseRoll();
        }}
      >
        <DialogContent className="sm:max-w-[440px] bg-nx-surface border-nx-line p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink">
              {t("profile.integrations.rollConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-3">
              {t("profile.integrations.rollConfirmDesc", {
                name: pendingRollToken?.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>

          {actionError && <p className="text-xs text-destructive font-medium">{actionError}</p>}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCloseRoll}
              disabled={isRollingToken}
              className="text-xs"
            >
              {t("profile.common.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              data-testid="confirm-roll-pat-btn"
              onClick={onConfirmRoll}
              disabled={isRollingToken}
              className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
            >
              {isRollingToken && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>{t("profile.integrations.rollTokenBtn")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(pendingRevokeToken)}
        onOpenChange={(open) => {
          if (!open) onCloseRevoke();
        }}
      >
        <DialogContent className="sm:max-w-[440px] bg-nx-surface border-nx-line p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink">
              {t("profile.integrations.revokeConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-3">
              {t("profile.integrations.revokeConfirmDesc", {
                name: pendingRevokeToken?.name ?? "",
              })}
            </DialogDescription>
          </DialogHeader>

          {actionError && <p className="text-xs text-destructive font-medium">{actionError}</p>}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCloseRevoke}
              disabled={isRevokingToken}
              className="text-xs"
            >
              {t("profile.common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              data-testid="confirm-revoke-pat-btn"
              onClick={onConfirmRevoke}
              disabled={isRevokingToken}
              className="text-xs font-semibold gap-1.5"
            >
              {isRevokingToken && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>{t("profile.integrations.revokeBtn")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
