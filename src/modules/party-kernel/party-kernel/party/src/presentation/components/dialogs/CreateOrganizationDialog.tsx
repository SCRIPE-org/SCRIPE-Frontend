"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { Building2, Phone, Mail, FileText, Loader2, Info, AlertTriangle, RefreshCw } from "lucide-react";
import { getPartyKernelContainer } from "../../../../../di";
import type { CreateOrganizationParams } from "../../../domain/interfaces/IPartyRepository";

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: CreateOrganizationParams) => Promise<string>;
  onSuccessNavigate?: (partyId: string) => void;
}

interface OrgPartialSaveState {
  partyId: string;
  legalName: string;
  failedPhone?: string;
  failedEmail?: string;
  errorMessage?: string;
}

/**
 * Modal dialog for creating a new Organization party with primary contact details.
 */
export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSubmit,
  onSuccessNavigate,
}: CreateOrganizationDialogProps) {
  const { t } = useI18n();

  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
  );
  const lastPayloadRef = useRef<string>("");
  const [partialSaveState, setPartialSaveState] = useState<OrgPartialSaveState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const resetForm = () => {
    setLegalName("");
    setDisplayName("");
    setTaxId("");
    setPhone("");
    setEmail("");
    setError(null);
    setPartialSaveState(null);
    setRetryError(null);
    lastPayloadRef.current = "";
    setIdempotencyKey(
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
    );
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleRetryAttach = async () => {
    if (!partialSaveState) return;
    try {
      setIsRetrying(true);
      setRetryError(null);
      const { partyRepository, contactPointRepository } = getPartyKernelContainer();

      // Re-read existing contacts to avoid duplicating an attached contact method if the 500/timeout was an uncertain write
      let existingContacts: { value: string; type: string }[] = [];
      try {
        if (contactPointRepository) {
          const res = await contactPointRepository.getAll({ page: 1, pageSize: 50 });
          existingContacts = res.items.filter((c) => c.partyId === partialSaveState.partyId);
        }
      } catch {
        // Fall back to safe write
      }

      if (
        partialSaveState.failedPhone &&
        !existingContacts.some((c) => c.value === partialSaveState.failedPhone)
      ) {
        await partyRepository.addContactPoint({
          partyId: partialSaveState.partyId,
          type: "phone",
          value: partialSaveState.failedPhone,
          isPrimary: true,
        });
      }
      if (
        partialSaveState.failedEmail &&
        !existingContacts.some((c) => c.value === partialSaveState.failedEmail)
      ) {
        await partyRepository.addContactPoint({
          partyId: partialSaveState.partyId,
          type: "email",
          value: partialSaveState.failedEmail,
          isPrimary: true,
        });
      }

      const partyId = partialSaveState.partyId;
      handleClose();
      if (onSuccessNavigate && partyId) {
        onSuccessNavigate(partyId);
      }
    } catch (err: unknown) {
      setRetryError(err instanceof Error ? err.message : "Failed to attach contact points");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLegal = legalName.trim();
    if (!trimmedLegal) {
      setError(t("party.dialog.legalNameRequired") || "Legal Business Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      let failedAttachment: { error: Error; partyId: string } | null = null;

      // Rotate idempotency key if intent payload changed, retain if retrying exact same payload
      const currentPayload = JSON.stringify({
        legalName: trimmedLegal,
        displayName: displayName.trim(),
        taxId: taxId.trim(),
      });

      let currentKey = idempotencyKey;
      if (lastPayloadRef.current && lastPayloadRef.current !== currentPayload) {
        currentKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `key-${Date.now()}`;
        setIdempotencyKey(currentKey);
      } else if (!currentKey) {
        currentKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `key-${Date.now()}`;
        setIdempotencyKey(currentKey);
      }
      lastPayloadRef.current = currentPayload;

      const partyId = await onSubmit({
        legalName: trimmedLegal,
        displayName: displayName.trim() || undefined,
        taxId: taxId.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        idempotencyKey: currentKey || undefined,
        onContactPointFailure: (err, pId) => {
          failedAttachment = { error: err, partyId: pId };
        },
      });

      if (failedAttachment) {
        setPartialSaveState({
          partyId,
          legalName: trimmedLegal,
          failedPhone: phone.trim() || undefined,
          failedEmail: email.trim() || undefined,
          errorMessage:
            (failedAttachment as { error: Error }).error.message ||
            t("party.dialog.partialSaveDesc") ||
            "Contact point service failed to attach",
        });
        return;
      }

      handleClose();
      if (onSuccessNavigate && partyId) {
        onSuccessNavigate(partyId);
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : "Failed to create organization";
      if (
        rawMessage.includes("QuotaExceeded") ||
        rawMessage.includes("limit reached") ||
        rawMessage.includes("quota")
      ) {
        setError(
          t("party.errors.quotaExceeded") ||
            "Maximum party profiles limit reached for your tenant subscription. Contact your administrator."
        );
      } else {
        setError(rawMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (partialSaveState) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t("party.dialog.partialSaveTitle") || "Party Identity Created"}</DialogTitle>
                <DialogDescription>
                  {t("party.dialog.partialSaveDesc") ||
                    "The contact record was created with canonical ID, but secondary contact points failed to attach."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg border border-nx-border bg-nx-surface-2/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-nx-ink-3">Canonical Party ID</span>
                <span className="font-mono text-nx-ink font-semibold">{partialSaveState.partyId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-nx-ink-3">Legal Business Name</span>
                <span className="text-nx-ink font-medium">{partialSaveState.legalName}</span>
              </div>
              {partialSaveState.failedPhone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-nx-ink-3">Pending Phone</span>
                  <span className="text-amber-400 font-mono">{partialSaveState.failedPhone}</span>
                </div>
              )}
              {partialSaveState.failedEmail && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-nx-ink-3">Pending Email</span>
                  <span className="text-amber-400 font-mono">{partialSaveState.failedEmail}</span>
                </div>
              )}
            </div>

            {retryError && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                {retryError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const partyId = partialSaveState.partyId;
                handleClose();
                if (onSuccessNavigate && partyId) {
                  onSuccessNavigate(partyId);
                }
              }}
              disabled={isRetrying}
            >
              {t("party.dialog.continueToProfile") || "Continue to Profile"}
            </Button>
            <Button
              type="button"
              onClick={handleRetryAttach}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("party.dialog.retryAttachContact") || "Retrying..."}
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t("party.dialog.retryAttachContact") || "Retry Attach Contact Details"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t("party.dialog.createOrgTitle")}</DialogTitle>
                <DialogDescription>
                  {t("party.dialog.createOrgDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            {/* Legal Name */}
            <div className="grid gap-2">
              <Label htmlFor="org-legal-name" className="text-nx-ink font-medium">
                {t("party.dialog.legalName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-legal-name"
                value={legalName}
                onChange={(e) => {
                  setLegalName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t("party.dialog.legalNamePlaceholder")}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            {/* Display / Commercial Name */}
            <div className="grid gap-2">
              <Label htmlFor="org-display-name" className="text-nx-ink font-medium">
                {t("party.dialog.displayName")}
              </Label>
              <Input
                id="org-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("party.dialog.displayNamePlaceholder")}
                disabled={isSubmitting}
              />
            </div>

            {/* Tax / CR Registration ID */}
            <div className="grid gap-2">
              <Label htmlFor="org-tax-id" className="text-nx-ink flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-nx-ink-3" />
                {t("party.dialog.taxId")}
              </Label>
              <Input
                id="org-tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={t("party.dialog.taxIdPlaceholder")}
                disabled={isSubmitting}
              />
              <div className="flex items-start gap-1.5 text-xs text-nx-ink-3">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-nx-ink-3" />
                <span>{t("party.dialog.taxIdHelp")}</span>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="grid gap-2">
                <Label htmlFor="org-phone" className="text-nx-ink flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.phone")}
                </Label>
                <Input
                  id="org-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("party.dialog.phonePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="org-email" className="text-nx-ink flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.email")}
                </Label>
                <Input
                  id="org-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("party.dialog.emailPlaceholder")}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("party.dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !legalName.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("party.dialog.create")}...
                </>
              ) : (
                t("party.dialog.create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
