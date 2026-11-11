"use client";

import { useState, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { AlertCircle } from "lucide-react";

interface ContactEditDialogProps {
  readonly isOpen: boolean;
  readonly isSubmitting: boolean;
  readonly submitError: string | null;
  readonly accountOptions: Array<{ id: string; displayName: string }>;
  readonly initialAccountId?: string;
  readonly initialJobTitle?: string;
  readonly initialDepartment?: string;
  readonly initialNotes?: string;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSave: (data: {
    primaryAccountId?: string;
    jobTitleSnapshot?: string;
    departmentName?: string;
    commercialNotes?: string;
  }) => Promise<void>;
  readonly isRtl: boolean;
  readonly t: (key: string) => string;
}

export function ContactEditDialog({
  isOpen,
  isSubmitting,
  submitError,
  accountOptions,
  initialAccountId,
  initialJobTitle,
  initialDepartment,
  initialNotes,
  onOpenChange,
  onSave,
  isRtl,
  t,
}: ContactEditDialogProps) {
  const [primaryAccount, setPrimaryAccount] = useState(initialAccountId || "__none__");
  const [jobTitle, setJobTitle] = useState(initialJobTitle || "");
  const [department, setDepartment] = useState(initialDepartment || "");
  const [notes, setNotes] = useState(initialNotes || "");

  useEffect(() => {
    if (isOpen) {
      setPrimaryAccount(initialAccountId || "__none__");
      setJobTitle(initialJobTitle || "");
      setDepartment(initialDepartment || "");
      setNotes(initialNotes || "");
    }
  }, [isOpen, initialAccountId, initialJobTitle, initialDepartment, initialNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedAccount =
      primaryAccount && primaryAccount !== "__none__" ? primaryAccount.trim() : undefined;
    await onSave({
      primaryAccountId: resolvedAccount,
      jobTitleSnapshot: jobTitle.trim() || undefined,
      departmentName: department.trim() || undefined,
      commercialNotes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading">
              {t("crmContacts.edit.title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmContacts.edit.description")}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3.5 py-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="edit-primary-account" className="text-nx-ink-2 font-medium">
                {t("crmContacts.create.primaryAccount")}
              </Label>
              <Select value={primaryAccount || "__none__"} onValueChange={setPrimaryAccount}>
                <SelectTrigger id="edit-primary-account" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink">
                  <SelectValue placeholder={t("crmContacts.create.selectAccountPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("crmContacts.create.noPrimaryAccount")}</SelectItem>
                  {accountOptions.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-job-title" className="text-nx-ink-2 font-medium">
                  {t("crmContacts.create.jobTitle")}
                </Label>
                <Input
                  id="edit-job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-department" className="text-nx-ink-2 font-medium">
                  {t("crmContacts.create.department")}
                </Label>
                <Input
                  id="edit-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-contact-notes" className="text-nx-ink-2 font-medium">
                {t("crmContacts.create.notes")}
              </Label>
              <Input
                id="edit-contact-notes"
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
              {t("crmContacts.actions.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold">
              {isSubmitting ? t("crmContacts.actions.saving") : t("crmContacts.actions.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
