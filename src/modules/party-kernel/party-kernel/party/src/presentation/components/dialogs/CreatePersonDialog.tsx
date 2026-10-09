"use client";

import { useState, useMemo } from "react";
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
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import {
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import type { CreatePersonParams } from "../../../domain/interfaces/IPartyRepository";

interface CreatePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: CreatePersonParams) => Promise<string>;
  onSuccessNavigate?: (partyId: string) => void;
  existingPartyNames?: string[];
}

export function CreatePersonDialog({
  open,
  onOpenChange,
  onSubmit,
  onSuccessNavigate,
  existingPartyNames = [],
}: CreatePersonDialogProps) {
  const { t } = useI18n();

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [givenName, setGivenName] = useState("");
  const [middleNames, setMiddleNames] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [showAdditionalNames, setShowAdditionalNames] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TASK 3: Maintain a stable idempotency key for the SAME business intent.
  // Preserved across double-submits, network timeouts, and retries.
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
  );

  const isPossibleDuplicate = useMemo(() => {
    const trimmed = fullName.trim().toLowerCase();
    if (!trimmed || trimmed.length < 3) return false;
    return existingPartyNames.some(
      (name) => name.toLowerCase() === trimmed
    );
  }, [fullName, existingPartyNames]);

  const resetForm = () => {
    setFullName("");
    setDisplayName("");
    setGivenName("");
    setMiddleNames("");
    setFamilyName("");
    setShowAdditionalNames(false);
    setDateOfBirth("");
    setIsMinor(false);
    setPhone("");
    setEmail("");
    setError(null);
    setIdempotencyKey(
      typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : ""
    );
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setError(t("party.dialog.nameRequired") || "Full Name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Stable idempotency key per intent passed to repository
      const partyId = await onSubmit({
        fullName: trimmedName,
        displayName: displayName.trim() || undefined,
        givenName: givenName.trim() || undefined,
        middleNames: middleNames.trim() || undefined,
        familyName: familyName.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        isMinor,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        idempotencyKey: idempotencyKey || undefined,
      });

      handleClose();
      if (onSuccessNavigate && partyId) {
        onSuccessNavigate(partyId);
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : "Failed to create person";
      // Gracefully format quota and concurrency errors
      if (rawMessage.includes("QuotaExceeded") || rawMessage.includes("quota")) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-nx-accent/10 text-nx-accent">
                <User className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{t("party.dialog.createPersonTitle")}</DialogTitle>
                <DialogDescription>
                  {t("party.dialog.createPersonDesc")}
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

            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="person-full-name" className="text-nx-ink font-medium">
                {t("party.dialog.fullName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="person-full-name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={t("party.dialog.fullNamePlaceholder")}
                  disabled={isSubmitting}
                  autoFocus
                  required
                />
              </div>
              <p className="text-xs text-nx-ink-3">
                {t("party.dialog.fullNameHelp")}
              </p>

              {/* Duplicate Detection Warning */}
              {isPossibleDuplicate && (
                <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-2.5 text-xs text-amber-500 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{t("party.dialog.duplicateWarning")}</span>
                </div>
              )}
            </div>

            {/* Optional Additional Names Accordion */}
            <div className="rounded-lg border border-nx-border bg-nx-surface-2/30 p-3">
              <button
                type="button"
                onClick={() => setShowAdditionalNames(!showAdditionalNames)}
                className="flex w-full items-center justify-between text-xs font-medium text-nx-ink hover:text-nx-accent transition-colors"
              >
                <span>{t("party.dialog.additionalNames")}</span>
                {showAdditionalNames ? (
                  <ChevronUp className="h-3.5 w-3.5 text-nx-ink-3" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-nx-ink-3" />
                )}
              </button>

              {showAdditionalNames && (
                <div className="grid gap-3 pt-3 mt-2 border-t border-nx-border/60">
                  <div className="grid gap-1.5">
                    <Label htmlFor="person-display-name" className="text-xs text-nx-ink-2">
                      {t("party.dialog.displayName")}
                    </Label>
                    <Input
                      id="person-display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={t("party.dialog.displayNamePlaceholder")}
                      disabled={isSubmitting}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="person-given-name" className="text-xs text-nx-ink-2">
                        {t("party.dialog.givenName")}
                      </Label>
                      <Input
                        id="person-given-name"
                        value={givenName}
                        onChange={(e) => setGivenName(e.target.value)}
                        placeholder="John"
                        disabled={isSubmitting}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="person-middle-names" className="text-xs text-nx-ink-2">
                        {t("party.dialog.middleNames")}
                      </Label>
                      <Input
                        id="person-middle-names"
                        value={middleNames}
                        onChange={(e) => setMiddleNames(e.target.value)}
                        placeholder="M."
                        disabled={isSubmitting}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="person-family-name" className="text-xs text-nx-ink-2">
                        {t("party.dialog.familyName")}
                      </Label>
                      <Input
                        id="person-family-name"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="Doe"
                        disabled={isSubmitting}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date of Birth & Minor Flag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="person-dob" className="text-nx-ink flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.dob")}
                </Label>
                <Input
                  id="person-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="person-is-minor"
                  checked={isMinor}
                  onCheckedChange={(checked) => setIsMinor(checked === true)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="person-is-minor"
                  className="text-xs text-nx-ink cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-nx-accent" />
                  {t("party.dialog.isMinorLabel")}
                </Label>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="grid gap-2">
                <Label htmlFor="person-phone" className="text-nx-ink flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.phone")}
                </Label>
                <Input
                  id="person-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("party.dialog.phonePlaceholder")}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="person-email" className="text-nx-ink flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-nx-ink-3" />
                  {t("party.dialog.email")}
                </Label>
                <Input
                  id="person-email"
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
            <Button
              type="submit"
              disabled={isSubmitting || !fullName.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("party.dialog.create")}...
                </>
              ) : (
                t("party.dialog.create") || "Create Person"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
