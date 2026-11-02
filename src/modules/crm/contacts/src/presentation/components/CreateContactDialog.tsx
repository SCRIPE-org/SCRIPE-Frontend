"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
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
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle, User } from "lucide-react";
import type { CreateContactInput } from "../../domain/entities/ContactEntity";

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateContactInput) => Promise<boolean>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function CreateContactDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  error,
}: CreateContactDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [personPartyId, setPersonPartyId] = useState("");
  const [primaryAccountId, setPrimaryAccountId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personPartyId.trim()) {
      setValidationError(
        t("crmContacts.create.personPartyRequired") || "Person Party ID is required."
      );
      return;
    }
    setValidationError(null);

    const success = await onSubmit({
      personPartyId: personPartyId.trim(),
      primaryAccountId: primaryAccountId.trim() || undefined,
      jobTitleSnapshot: jobTitle.trim() || undefined,
      departmentName: department.trim() || undefined,
      commercialNotes: notes.trim() || undefined,
    });

    if (success) {
      setPersonPartyId("");
      setPrimaryAccountId("");
      setJobTitle("");
      setDepartment("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                <User className="size-4 text-nx-accent" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-nx-ink font-heading">
                  {t("crmContacts.create.title") || "Register Commercial Contact"}
                </DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-2">
                  {t("crmContacts.create.description") ||
                    "Link an enterprise PartyKernel person into the CRM commercial catalog."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {(validationError || error) && (
            <Alert variant="destructive" className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{validationError || error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3.5 py-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="contact-personPartyId" className="text-nx-ink-2 font-medium">
                {t("crmContacts.create.personPartyId") || "Person Party ID / GUID"} *
              </Label>
              <Input
                id="contact-personPartyId"
                placeholder="e.g. 7a110002-f40c-4df5-b1ba-760ce297b8d7"
                value={personPartyId}
                onChange={(e) => setPersonPartyId(e.target.value)}
                required
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-primaryAccount" className="text-nx-ink-2 font-medium">
                {t("crmContacts.create.primaryAccountId") || "Primary Account ID (Optional)"}
              </Label>
              <Input
                id="contact-primaryAccount"
                placeholder="e.g. 7a330001-f40c-4df5-b1ba-760ce297b8d7"
                value={primaryAccountId}
                onChange={(e) => setPrimaryAccountId(e.target.value)}
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-jobTitle" className="text-nx-ink-2 font-medium">
                  {t("crmContacts.create.jobTitle") || "Job Title"}
                </Label>
                <Input
                  id="contact-jobTitle"
                  placeholder="e.g. Procurement Director"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-department" className="text-nx-ink-2 font-medium">
                  {t("crmContacts.create.department") || "Department"}
                </Label>
                <Input
                  id="contact-department"
                  placeholder="e.g. Commercial Operations"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-notes" className="text-nx-ink-2 font-medium">
                {t("crmContacts.create.notes") || "Commercial Context & Notes"}
              </Label>
              <Input
                id="contact-notes"
                placeholder={t("crmContacts.create.notesPlaceholder") || "Key decision maker for sponsorships..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line text-nx-ink-2"
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs font-bold"
            >
              {isSubmitting
                ? t("common.saving") || "Saving..."
                : t("crmContacts.create.submit") || "Create Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
