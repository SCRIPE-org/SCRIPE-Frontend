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
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Edit3,
  Lock,
  Loader2,
  Calendar,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Party } from "../../../domain/entities/Party";
import type { PartyProfile } from "../../../domain/entities/PartyProfile";

/**
 * Subtype attributes submitted when editing a Party record.
 */
export interface EditPartySubmitOptions {
  type?: string;
  fullName?: string;
  givenName?: string;
  middleNames?: string;
  familyName?: string;
  dateOfBirth?: string | null;
  isMinor?: boolean;
  legalName?: string;
  taxId?: string | null;
  rowVersion?: string | null;
}

interface EditPartyDialogProps {
  party: Party | null;
  profile?: PartyProfile | null;
  initialFullName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    id: string,
    displayName: string,
    options?: EditPartySubmitOptions
  ) => Promise<void>;
}

function toDateInputValue(isoOrDate?: string | null): string {
  if (!isoOrDate) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(isoOrDate);
  if (match) return match[1];
  try {
    const d = new Date(isoOrDate);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  } catch {
    // ignore
  }
  return "";
}

function EditPartyForm({
  party,
  profile,
  initialFullName,
  onClose,
  onSubmit,
}: {
  party: Party;
  profile?: PartyProfile | null;
  initialFullName?: string | null;
  onClose: () => void;
  onSubmit: (
    id: string,
    displayName: string,
    options?: EditPartySubmitOptions
  ) => Promise<void>;
}) {
  const { t } = useI18n();

  const resolvedInitialFullName =
    initialFullName || profile?.fullName || party.fullName || party.displayName;
  const resolvedInitialLegalName =
    profile?.legalName || party.legalName || party.displayName;

  const [fullName, setFullName] = useState(resolvedInitialFullName);
  const [displayName, setDisplayName] = useState(party.displayName);
  const [givenName, setGivenName] = useState(
    profile?.person?.givenName || profile?.person?.firstName || ""
  );
  const [middleNames, setMiddleNames] = useState(
    profile?.person?.middleNames || ""
  );
  const [familyName, setFamilyName] = useState(
    profile?.person?.familyName || profile?.person?.lastName || ""
  );
  const [showAdditionalNames, setShowAdditionalNames] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(
    toDateInputValue(profile?.person?.dateOfBirth)
  );
  const [isMinor, setIsMinor] = useState<boolean>(
    Boolean(profile?.person?.isMinor)
  );

  const [legalName, setLegalName] = useState(resolvedInitialLegalName);
  const [taxId, setTaxId] = useState(profile?.organization?.taxId || profile?.taxId || "");

  const [hasEditedFullName, setHasEditedFullName] = useState(false);
  const [prevInitialFullName, setPrevInitialFullName] = useState(initialFullName);
  const [prevProfileId, setPrevProfileId] = useState(profile?.id);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (initialFullName !== prevInitialFullName) {
    setPrevInitialFullName(initialFullName);
    if (initialFullName && !hasEditedFullName && !error) {
      setFullName(initialFullName);
    }
  }

  if (profile?.id && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    if (party.isPerson && profile.person) {
      if (!hasEditedFullName && profile.fullName) {
        setFullName(profile.fullName);
      }
      setGivenName(profile.person.givenName || profile.person.firstName || "");
      setMiddleNames(profile.person.middleNames || "");
      setFamilyName(profile.person.familyName || profile.person.lastName || "");
      setDateOfBirth(toDateInputValue(profile.person.dateOfBirth));
      setIsMinor(Boolean(profile.person.isMinor));
    } else if (party.isOrganization) {
      if (profile.legalName) {
        setLegalName(profile.legalName);
      }
      setTaxId(profile.organization?.taxId || profile.taxId || "");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDisplayName = displayName.trim();
    const trimmedFullName = fullName.trim();
    const trimmedLegalName = legalName.trim();

    if (party.isPerson && !trimmedFullName) {
      setError(t("party.dialog.nameRequired") || "Full name is required");
      return;
    }
    if (party.isOrganization && !trimmedLegalName && !trimmedDisplayName) {
      setError(t("party.dialog.legalNameRequired") || "Legal Business Name is required");
      return;
    }
    if (!trimmedDisplayName && !trimmedFullName && !trimmedLegalName) {
      setError(t("party.dialog.nameRequired") || "Display name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      if (party.isPerson) {
        await onSubmit(party.id, trimmedDisplayName || trimmedFullName, {
          type: party.type,
          fullName: trimmedFullName,
          givenName: givenName.trim() || undefined,
          middleNames: middleNames.trim() || undefined,
          familyName: familyName.trim() || undefined,
          dateOfBirth: dateOfBirth ? dateOfBirth : null,
          isMinor,
        });
      } else {
        await onSubmit(party.id, trimmedDisplayName || trimmedLegalName, {
          type: party.type,
          legalName: trimmedLegalName || trimmedDisplayName,
          taxId: taxId.trim() || null,
        });
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update party";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nx-accent/10 text-nx-accent">
            <Edit3 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>
              {t("party.dialog.editPartyTitle") || t("party.dialog.editNameTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("party.dialog.editPartyDesc") || t("party.dialog.editNameDesc")}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {error && (
          <div
            role="alert"
            className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20"
          >
            {error}
          </div>
        )}

        {/* Immutable Identity Attributes Info */}
        <div className="flex items-center justify-between rounded-lg bg-nx-surface-2 p-3 text-xs border border-nx-border">
          <div className="space-y-1">
            <span className="text-nx-ink-3 block">
              {t("party.profile.immutableType")}
            </span>
            <Badge variant={party.isPerson ? "info" : "success"}>
              {party.type}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-nx-ink-3">
            <Lock className="h-3.5 w-3.5" />
            <span>ADR-002 Locked</span>
          </div>
        </div>

        {party.isPerson ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="edit-party-fullname" className="text-nx-ink font-medium">
                {t("party.dialog.fullName") || "Full Name"}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-party-fullname"
                value={fullName}
                onChange={(e) => {
                  setHasEditedFullName(true);
                  setFullName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            {/* Display Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="edit-party-name" className="text-nx-ink font-medium">
                {t("party.dialog.displayName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-party-name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Optional Additional Names Accordion */}
            <div className="rounded-lg border border-nx-border bg-nx-surface-2/30 p-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdditionalNames(!showAdditionalNames)}
                className="flex w-full items-center justify-between text-xs font-medium text-nx-ink hover:text-nx-accent transition-colors p-0 h-auto hover:bg-transparent"
              >
                <span>{t("party.dialog.additionalNames")}</span>
                {showAdditionalNames ? (
                  <ChevronUp className="h-3.5 w-3.5 text-nx-ink-3" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-nx-ink-3" />
                )}
              </Button>

              {showAdditionalNames && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 mt-2 border-t border-nx-border/60">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-person-given-name" className="text-xs text-nx-ink-2">
                      {t("party.dialog.givenName")}
                    </Label>
                    <Input
                      id="edit-person-given-name"
                      value={givenName}
                      onChange={(e) => setGivenName(e.target.value)}
                      disabled={isSubmitting}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-person-middle-names" className="text-xs text-nx-ink-2">
                      {t("party.dialog.middleNames")}
                    </Label>
                    <Input
                      id="edit-person-middle-names"
                      value={middleNames}
                      onChange={(e) => setMiddleNames(e.target.value)}
                      disabled={isSubmitting}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-person-family-name" className="text-xs text-nx-ink-2">
                      {t("party.dialog.familyName")}
                    </Label>
                    <Input
                      id="edit-person-family-name"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      disabled={isSubmitting}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Date of Birth & Minor Flag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-person-dob" className="text-nx-ink flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.dob")}
                </Label>
                <Input
                  id="edit-person-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="edit-person-is-minor"
                  checked={isMinor}
                  onCheckedChange={(checked) => setIsMinor(checked === true)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="edit-person-is-minor"
                  className="text-xs text-nx-ink cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-nx-accent" />
                  {t("party.dialog.isMinorLabel")}
                </Label>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Organization Legal Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-org-legal-name" className="text-nx-ink font-medium">
                {t("party.dialog.legalName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-org-legal-name"
                value={legalName}
                onChange={(e) => {
                  setLegalName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            {/* Display Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="edit-party-name" className="text-nx-ink font-medium">
                {t("party.dialog.displayName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-party-name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Organization Tax / CR Registration ID */}
            <div className="grid gap-2">
              <Label htmlFor="edit-org-tax-id" className="text-nx-ink flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-nx-ink-3" />
                {t("party.dialog.taxId")}
              </Label>
              <Input
                id="edit-org-tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={t("party.dialog.taxIdPlaceholder")}
                disabled={isSubmitting}
              />
            </div>
          </>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          {t("party.dialog.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !displayName.trim() ||
            (party.isPerson && !fullName.trim()) ||
            (party.isOrganization && !legalName.trim())
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("party.dialog.save")}...
            </>
          ) : (
            t("party.dialog.save")
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Modal dialog for editing a party's identity and subtype details.
 */
export function EditPartyDialog({
  party,
  profile,
  initialFullName,
  open,
  onOpenChange,
  onSubmit,
}: EditPartyDialogProps) {
  if (!party) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <EditPartyForm
          key={`${party.id}-${open ? "open" : "closed"}`}
          party={party}
          profile={profile}
          initialFullName={initialFullName}
          onClose={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
