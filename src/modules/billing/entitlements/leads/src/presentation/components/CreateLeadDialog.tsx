"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { PhoneInput, isValidPhoneNumber } from "@core/ui/phone-input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { Loader2, PlusCircle } from "lucide-react";

/**
 * Interface defining property specifications, keys types, and structural contract rules for create lead form data.
 */
export interface CreateLeadFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  editionKey?: string;
  message?: string;
  notes?: string;
}

interface CreateLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadFormData) => Promise<void>;
  isSubmitting: boolean;
  availableEditions: Array<{ key: string; displayName: string }>;
}

const emptyForm: CreateLeadFormData = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  editionKey: undefined,
  message: "",
  notes: "",
};

/**
 * Presentation UI component rendering the create lead dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CreateLeadDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  availableEditions,
}: CreateLeadDialogProps) {
  const { t } = useI18n();

  const [form, setForm] = useState<CreateLeadFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateLeadFormData, string>>>({});

  const set = (field: keyof CreateLeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const reset = () => {
    setForm(emptyForm);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.companyName.trim()) next.companyName = t("leads.createDialog.errors.companyRequired");
    if (!form.contactName.trim()) next.contactName = t("leads.createDialog.errors.contactRequired");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("leads.createDialog.errors.emailInvalid");
    }
    if (form.phone?.trim() && !isValidPhoneNumber(form.phone)) {
      next.phone = t("leads.createDialog.errors.phoneInvalid");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    await onSubmit({
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || undefined,
      editionKey: form.editionKey || undefined,
      message: form.message?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    });
    reset();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
              <PlusCircle className="h-5 w-5 text-info" />
            </div>
            <div>
              <DialogTitle>{t("leads.createDialog.title")}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("leads.createDialog.subtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cl-company">
                {t("leads.createDialog.company")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cl-company"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder={t("leads.createDialog.companyPlaceholder")}
                className={errors.companyName ? "border-destructive" : undefined}
                disabled={isSubmitting}
              />
              {errors.companyName && (
                <p className="text-xs text-destructive">{errors.companyName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cl-contact">
                {t("leads.createDialog.contact")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cl-contact"
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder={t("leads.createDialog.contactPlaceholder")}
                className={errors.contactName ? "border-destructive" : undefined}
                disabled={isSubmitting}
              />
              {errors.contactName && (
                <p className="text-xs text-destructive">{errors.contactName}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cl-email">
                {t("leads.createDialog.email")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cl-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="name@company.com"
                className={errors.email ? "border-destructive" : undefined}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cl-phone">{t("leads.createDialog.phone")}</Label>
              <PhoneInput
                id="cl-phone"
                value={form.phone}
                onChange={(val) => set("phone", val)}
                disabled={isSubmitting}
                error={errors.phone}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          {availableEditions.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="cl-edition">{t("leads.createDialog.editionInterest")}</Label>
              <Select
                value={form.editionKey ?? "none"}
                onValueChange={(value) => set("editionKey", value === "none" ? "" : value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="cl-edition">
                  <SelectValue placeholder={t("leads.createDialog.editionPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("leads.createDialog.editionNone")}</SelectItem>
                  {availableEditions.map((edition) => (
                    <SelectItem key={edition.key} value={edition.key}>
                      {edition.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cl-message">{t("leads.createDialog.message")}</Label>
            <Textarea
              id="cl-message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder={t("leads.createDialog.messagePlaceholder")}
              rows={3}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cl-notes">{t("leads.createDialog.notes")}</Label>
            <Textarea
              id="cl-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={t("leads.createDialog.notesPlaceholder")}
              rows={2}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t("leads.createDialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("leads.createDialog.creating")}
                </>
              ) : (
                t("leads.createDialog.create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
