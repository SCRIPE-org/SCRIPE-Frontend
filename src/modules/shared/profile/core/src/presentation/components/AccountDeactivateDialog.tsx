"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription } from "@core/ui/alert";
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
import { AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";

/** Props for {@link AccountDeactivateDialog}. */
export interface AccountDeactivateDialogProps {
  /** Controls modal visibility. */
  open: boolean;
  /** Visibility change callback. */
  onOpenChange: (open: boolean) => void;
  /** Username required to match confirmation input. */
  username: string;
  /** When true, sole-primary-owner guardrail prevents account deactivation. */
  isSolePrimaryOwner: boolean;
  /** Organization name shown in sole-owner transfer warning. */
  primaryOrgName: string;
  /** Controlled username confirmation text. */
  confirmUsername: string;
  /** Controlled 6-digit sudo verification code. */
  sudoCode: string;
  /** True while deactivation request is in flight. */
  isSubmitting?: boolean;
  /** Validation or server error message from the last deactivation attempt. */
  error?: string | null;
  /** Updates username confirmation input. */
  onConfirmUsernameChange: (value: string) => void;
  /** Updates 6-digit sudo verification input. */
  onSudoCodeChange: (value: string) => void;
  /** Confirms and triggers account deactivation. */
  onConfirmDeactivate: () => Promise<void>;
}

/**
 * Guardrailed account deactivation confirmation dialog requiring username confirmation
 * and step-up sudo code, blocked automatically for sole primary organization owners.
 */
export function AccountDeactivateDialog({
  open,
  onOpenChange,
  username,
  isSolePrimaryOwner,
  primaryOrgName,
  confirmUsername,
  sudoCode,
  isSubmitting = false,
  error,
  onConfirmUsernameChange,
  onSudoCodeChange,
  onConfirmDeactivate,
}: AccountDeactivateDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="deactivate-account-modal"
        className="sm:max-w-lg border border-nx-line bg-nx-surface text-nx-ink"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" style={{ minWidth: 20, minHeight: 20 }} />
            <DialogTitle className="text-base font-bold text-nx-ink">
              {t("profile.lifecycle.modalTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-nx-ink-2 pt-1">
            {t("profile.lifecycle.modalSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {isSolePrimaryOwner && (
          <div
            data-testid="sole-owner-guardrail-banner"
            className="rounded-xl border border-warning/40 bg-warning/10 p-3.5 space-y-1.5"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
              <span>{t("profile.lifecycle.soleOwnerGuardrailTitle")}</span>
            </div>
            <p className="text-xs text-nx-ink-2 leading-relaxed">
              {t("profile.lifecycle.soleOwnerGuardrailBody", { org: primaryOrgName })}
            </p>
          </div>
        )}

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="deactivate-confirm-username" className="text-xs font-semibold text-nx-ink">
              {t("profile.lifecycle.confirmUsernameLabel", { username })}
            </Label>
            <Input
              id="deactivate-confirm-username"
              data-testid="deactivate-confirm-username-input"
              value={confirmUsername}
              onChange={(e) => onConfirmUsernameChange(e.target.value)}
              placeholder={username}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deactivate-sudo-code" className="text-xs font-semibold text-nx-ink">
              {t("profile.lifecycle.sudoCodeLabel")}
            </Label>
            <Input
              id="deactivate-sudo-code"
              data-testid="deactivate-sudo-code-input"
              value={sudoCode}
              disabled={isSubmitting}
              onChange={(e) => onSudoCodeChange(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" data-testid="deactivate-error-alert">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            {t("profile.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            data-testid="confirm-deactivate-account-btn"
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              isSolePrimaryOwner ||
              confirmUsername !== username ||
              sudoCode.trim().length < 6
            }
            onClick={() => void onConfirmDeactivate()}
            className="bg-destructive text-nx-on-fill font-semibold"
          >
            {isSolePrimaryOwner
              ? t("profile.lifecycle.transferOwnershipRequiredBtn")
              : t("profile.lifecycle.confirmDeactivateBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
