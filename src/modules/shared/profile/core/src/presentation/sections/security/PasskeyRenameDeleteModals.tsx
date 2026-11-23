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
import type { PasskeyCredential } from "../../../domain/entities/PasskeyCredential";
import { isSudoCancelledError } from "../../utils/sudoElevation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

function isLastCredentialLockError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as {
    status?: number;
    errorCode?: string;
    message?: string;
    response?: { status?: number; data?: { errorCode?: string; code?: string } };
    details?: { statusCode?: number; errorCode?: string };
  };
  const status = anyErr.status ?? anyErr.response?.status ?? anyErr.details?.statusCode;
  const code =
    anyErr.errorCode ??
    anyErr.response?.data?.errorCode ??
    anyErr.response?.data?.code ??
    anyErr.details?.errorCode ??
    "";
  return (
    code === "Identity.LastCredentialLocked" ||
    status === 422 ||
    (anyErr.message ?? "").includes("LastCredentialLocked")
  );
}

/**
 * Props for PasskeyRenameDeleteModals.
 */
export interface PasskeyRenameDeleteModalsProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  totalPasskeysCount: number;
  renameTarget: PasskeyCredential | null;
  isRenamingPasskey: boolean;
  deleteTarget: PasskeyCredential | null;
  isRemovingPasskey: boolean;
  onRenameClose: () => void;
  onRenameSubmit: (id: string, newName: string) => Promise<void>;
  onDeleteClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

/**
 * Passkey rename dialog and last-credential-aware delete confirmation dialog.
 */
export function PasskeyRenameDeleteModals({
  t,
  totalPasskeysCount,
  renameTarget,
  isRenamingPasskey,
  deleteTarget,
  isRemovingPasskey,
  onRenameClose,
  onRenameSubmit,
  onDeleteClose,
  onConfirmDelete,
}: PasskeyRenameDeleteModalsProps) {
  type TargetEntry = { id: string; value: string };
  const [renameDraft, setRenameDraft] = useState<TargetEntry | null>(null);
  const [renameErrorState, setRenameErrorState] = useState<TargetEntry | null>(null);
  const [deleteErrorState, setDeleteErrorState] = useState<TargetEntry | null>(null);

  const renameTargetId = renameTarget?.id ?? null;
  const renameTargetName = renameTarget?.deviceName ?? "";
  const deleteTargetId = deleteTarget?.id ?? null;

  const renameValue = renameDraft?.id === renameTargetId ? renameDraft.value : renameTargetName;
  const renameError = renameErrorState?.id === renameTargetId ? renameErrorState.value : null;
  const deleteError = deleteErrorState?.id === deleteTargetId ? deleteErrorState.value : null;

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    setRenameErrorState(null);
    try {
      await onRenameSubmit(renameTarget.id, renameValue.trim());
      toast.success(t("profile.passkeys.renameSuccess"));
      setRenameDraft(null);
      onRenameClose();
    } catch (err) {
      if (isSudoCancelledError(err)) return;
      setRenameErrorState({
        id: renameTarget.id,
        value: err instanceof Error ? err.message : t("profile.common.error"),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteErrorState(null);
    try {
      await onConfirmDelete(deleteTarget.id);
      toast.success(t("profile.passkeys.deleteSuccess"));
      onDeleteClose();
    } catch (err) {
      if (isSudoCancelledError(err)) return;
      setDeleteErrorState({
        id: deleteTarget.id,
        value: isLastCredentialLockError(err)
          ? t("profile.passkeys.lastCredentialError")
          : err instanceof Error
            ? err.message
            : t("profile.common.error"),
      });
    }
  };

  const handleRenameClose = () => {
    setRenameDraft(null);
    setRenameErrorState(null);
    onRenameClose();
  };

  const handleDeleteClose = () => {
    setDeleteErrorState(null);
    onDeleteClose();
  };

  return (
    <>
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && handleRenameClose()}>
        <DialogContent className="sm:max-w-md border-nx-line bg-nx-surface text-nx-ink">
          <form onSubmit={(e) => void handleRenameSubmit(e)}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-nx-ink">
                {t("profile.passkeys.renameTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs text-nx-ink-2">
                {t("profile.passkeys.renameDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="rename-passkey-input" className="text-xs font-medium text-nx-ink">
                  {t("profile.passkeys.renameInputLabel")}
                </Label>
                <Input
                  id="rename-passkey-input"
                  value={renameValue}
                  onChange={(e) => {
                    if (renameTarget) setRenameDraft({ id: renameTarget.id, value: e.target.value });
                  }}
                  maxLength={100}
                  required
                  className="bg-nx-raised border-nx-line text-nx-ink"
                />
              </div>
              {renameError && (
                <p className="text-xs text-destructive" role="alert">
                  {renameError}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRenameClose}
                className="border-nx-line text-nx-ink-2"
              >
                {t("profile.common.cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isRenamingPasskey || !renameValue.trim()}
                className="bg-nx-accent-fill text-nx-on-fill font-semibold gap-1.5"
              >
                {isRenamingPasskey && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{t("profile.passkeys.renameConfirmBtn")}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && handleDeleteClose()}>
        <DialogContent className="sm:max-w-md border-nx-line bg-nx-surface text-nx-ink">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>{t("profile.passkeys.deleteConfirmTitle")}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("profile.passkeys.deleteConfirmDesc")}
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-3 py-2">
              <div className="rounded-xl border border-nx-line bg-nx-raised p-3 space-y-1">
                <p className="text-xs font-bold text-nx-ink">{deleteTarget.deviceName}</p>
                <p className="text-[11px] font-mono text-nx-ink-3" dir="ltr">
                  <bdi>{deleteTarget.credentialIdMasked}</bdi>
                </p>
              </div>
              {totalPasskeysCount <= 1 && (
                <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 flex items-start gap-2 text-xs text-warning">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{t("profile.passkeys.deleteWarning")}</span>
                </div>
              )}
              {deleteError && (
                <div
                  className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
                  role="alert"
                >
                  {deleteError}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleDeleteClose} className="border-nx-line text-nx-ink-2">
              {t("profile.common.cancel")}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete()} disabled={isRemovingPasskey} data-testid="confirm-delete-passkey-btn" className="font-semibold gap-1.5">
              {isRemovingPasskey && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{t("profile.passkeys.deleteConfirmBtn")}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
