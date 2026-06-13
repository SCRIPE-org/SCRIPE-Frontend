"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateLeadDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  availableEditions,
}: CreateLeadDialogProps) {
  const { t } = useI18n();

  const [form, setForm] = useState<CreateLeadFormData>({
    companyName: "",
    contactName: "",
    email:       "",
    phone:       "",
    editionKey:  undefined,
    message:     "",
    notes:       "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateLeadFormData, string>>>({});

  const set = (field: keyof CreateLeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.companyName.trim()) next.companyName = t("leads.createDialog.errors.companyRequired");
    if (!form.contactName.trim()) next.contactName = t("leads.createDialog.errors.contactRequired");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = t("leads.createDialog.errors.emailInvalid");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email:       form.email.trim(),
      phone:       form.phone?.trim() || undefined,
      editionKey:  form.editionKey || undefined,
      message:     form.message?.trim() || undefined,
      notes:       form.notes?.trim() || undefined,
    });
    // Reset on success
    setForm({ companyName: "", contactName: "", email: "", phone: "", editionKey: undefined, message: "", notes: "" });
    setErrors({});
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setForm({ companyName: "", contactName: "", email: "", phone: "", editionKey: undefined, message: "", notes: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-lg font-semibold">
            {t("leads.createDialog.title")}
          </DialogTitle>
          <p className="text-sm text-zinc-400 mt-1">{t("leads.createDialog.subtitle")}</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Company + Contact (2-col) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cl-company" className="text-xs text-zinc-400">
                {t("leads.createDialog.company")} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="cl-company"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder={t("leads.createDialog.companyPlaceholder")}
                className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 ${
                  errors.companyName ? "border-red-500" : ""
                }`}
              />
              {errors.companyName && (
                <p className="text-xs text-red-400">{errors.companyName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cl-contact" className="text-xs text-zinc-400">
                {t("leads.createDialog.contact")} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="cl-contact"
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder={t("leads.createDialog.contactPlaceholder")}
                className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 ${
                  errors.contactName ? "border-red-500" : ""
                }`}
              />
              {errors.contactName && (
                <p className="text-xs text-red-400">{errors.contactName}</p>
              )}
            </div>
          </div>

          {/* Email + Phone (2-col) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cl-email" className="text-xs text-zinc-400">
                {t("leads.createDialog.email")} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="cl-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="name@company.com"
                className={`bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cl-phone" className="text-xs text-zinc-400">
                {t("leads.createDialog.phone")}
              </Label>
              <Input
                id="cl-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+1 555 000 0000"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Edition Interest */}
          {availableEditions.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="cl-edition" className="text-xs text-zinc-400">
                {t("leads.createDialog.editionInterest")}
              </Label>
              <Select
                value={form.editionKey ?? "none"}
                onValueChange={(v) => set("editionKey", v === "none" ? "" : v)}
              >
                <SelectTrigger id="cl-edition" className="bg-zinc-900 border-zinc-700 text-white">
                  <SelectValue placeholder={t("leads.createDialog.editionPlaceholder")} />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="none">
                    <span className="text-zinc-500">{t("leads.createDialog.editionNone")}</span>
                  </SelectItem>
                  {availableEditions.map((e) => (
                    <SelectItem key={e.key} value={e.key}>
                      {e.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="cl-message" className="text-xs text-zinc-400">
              {t("leads.createDialog.message")}
            </Label>
            <Textarea
              id="cl-message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder={t("leads.createDialog.messagePlaceholder")}
              rows={3}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cl-notes" className="text-xs text-zinc-400">
              {t("leads.createDialog.notes")}
            </Label>
            <Textarea
              id="cl-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={t("leads.createDialog.notesPlaceholder")}
              rows={2}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            id="cl-cancel"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-zinc-700 text-zinc-400 hover:text-white"
          >
            {t("leads.createDialog.cancel")}
          </Button>
          <Button
            id="cl-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
          >
            {isSubmitting
              ? t("leads.createDialog.creating")
              : t("leads.createDialog.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
