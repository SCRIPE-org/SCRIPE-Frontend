"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Party } from "../../../domain/entities/Party";

interface DeletePartyDialogProps {
  party: Party | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => Promise<void>;
  onSuccess?: () => void;
}

export function DeletePartyDialog({
  party,
  open,
  onOpenChange,
  onConfirm,
  onSuccess,
}: DeletePartyDialogProps) {
  const { t } = useI18n();

  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!party) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(party.id);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete party";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-destructive">
                {t("party.dialog.deleteTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("party.dialog.deleteWarning")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 space-y-3">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-nx-surface-2 p-3 space-y-1.5 border border-nx-border">
            <div className="text-xs text-nx-ink-3">Target Entity:</div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-nx-ink">
                {party.displayName}
              </span>
              <Badge variant={party.isPerson ? "info" : "success"}>
                {party.type}
              </Badge>
            </div>
            <div className="text-xs font-mono text-nx-ink-3 truncate">
              ID: {party.id}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("party.dialog.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("party.dialog.deleteConfirmBtn")}...
              </>
            ) : (
              t("party.dialog.deleteConfirmBtn")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
