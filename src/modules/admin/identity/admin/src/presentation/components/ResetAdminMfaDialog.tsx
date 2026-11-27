/**
 * ResetAdminMfaDialog — Formal Administrator MFA Reset Recovery Dialog
 *
 * Disables TOTP and backup codes, revokes all active sessions, forces MFA
 * re-enrollment upon next login, and optionally revokes registered passkeys.
 * Protected by Sudo step-up elevation on the backend (`Identity.SudoRequired`).
 *
 * @module admin/presentation/components
 */
"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { GenericModal } from "@core/crud/components/generic-modal";
import { useI18n } from "@core/providers/i18n-provider";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import type { Admin } from "../../domain/entities/Admin";
import type { ResetAdminMfaRequest } from "../../domain/entities/AdminRequests";

export interface ResetAdminMfaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  onResetMfa: (request: ResetAdminMfaRequest) => Promise<void>;
  isLoading: boolean;
}

/**
 * Confirmation modal for resetting an administrator's MFA factors (`POST /api/v1/admins/{id}/reset-mfa`).
 * Uses `@core/ui/*` primitives and `GenericModal` (preserving dialog state during Sudo step-up elevation).
 */
export function ResetAdminMfaDialog({
  open,
  onOpenChange,
  admin,
  onResetMfa,
  isLoading,
}: ResetAdminMfaDialogProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [revokePasskeys, setRevokePasskeys] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setReason("");
      setRevokePasskeys(false);
      setSubmitError(null);
    }
  }

  const trimmedReason = reason.trim();
  const isReasonTooLong = trimmedReason.length > 500;

  const handleSubmit = async () => {
    if (isReasonTooLong) {
      setSubmitError(t("admin.validation.reasonMax"));
      return;
    }
    setSubmitError(null);
    try {
      await onResetMfa({
        reason: trimmedReason || undefined,
        revokePasskeys,
      });
      onOpenChange(false);
    } catch {
      // Keep dialog open on backend rejection or Sudo step-up cancellation
    }
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("admin.resetMfaTitle")}
      description={`${t("admin.resetMfaDescription")} ${admin?.displayName || admin?.username || ""}`}
      size="md"
    >
      <div className="space-y-4 py-2">
        {submitError && (
          <Alert variant="destructive">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Alert variant="warning">
          <ShieldAlert aria-hidden="true" />
          <AlertTitle>{t("admin.resetMfaImpactTitle")}</AlertTitle>
          <AlertDescription>{t("admin.resetMfaImpactDesc")}</AlertDescription>
        </Alert>

        <div className="flex items-start gap-3 rounded-nx-lg border border-nx-line bg-nx-raised p-3.5">
          <Checkbox
            id="reset-mfa-revoke-passkeys"
            checked={revokePasskeys}
            onCheckedChange={(checked) => setRevokePasskeys(checked === true)}
            disabled={isLoading}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label
              htmlFor="reset-mfa-revoke-passkeys"
              className="cursor-pointer text-sm font-medium text-nx-ink"
            >
              {t("admin.resetMfaRevokePasskeys")}
            </Label>
            <p className="text-xs text-nx-ink-2">{t("admin.resetMfaRevokePasskeysDesc")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-reset-mfa-reason">{t("admin.auditReasonLabel")}</Label>
          <Textarea
            id="admin-reset-mfa-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setSubmitError(null);
            }}
            maxLength={500}
            rows={3}
            disabled={isLoading}
            placeholder={t("admin.auditReasonPlaceholder")}
          />
          <p className="text-xs text-nx-ink-3">{t("admin.auditReasonHint")}</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={isLoading || isReasonTooLong}
            variant="destructive"
          >
            {t("admin.resetMfaConfirmCta")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
