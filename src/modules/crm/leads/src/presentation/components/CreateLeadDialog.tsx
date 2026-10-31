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
import { Textarea } from "@core/ui/textarea";
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle } from "lucide-react";
import type { CreateLeadInput } from "../../domain/models/crm-lead.types";

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateLeadInput) => Promise<boolean>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function CreateLeadDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  submitError,
}: CreateLeadDialogProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const [formData, setFormData] = useState<CreateLeadInput>({
    title: "",
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    source: "Inbound",
    estimatedValue: undefined,
    currency: "SAR",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title?.trim()) {
      errs.title = "Title is required";
    }

    const hasCompany = Boolean(formData.companyName?.trim() || formData.submissionCompanyName?.trim());
    const hasContact = Boolean(
      formData.firstName?.trim() ||
      formData.lastName?.trim() ||
      formData.submissionContactName?.trim()
    );

    if (!hasCompany && !hasContact) {
      errs.identity = "Either Company or Contact Name is required (D1=B)";
    }

    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = "Invalid email format";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit({
      ...formData,
      title: formData.title?.trim(),
      firstName: formData.firstName?.trim() || undefined,
      lastName: formData.lastName?.trim() || undefined,
      companyName: formData.companyName?.trim() || undefined,
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      source: formData.source?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    });

    if (success) {
      setFormData({
        title: "",
        firstName: "",
        lastName: "",
        companyName: "",
        email: "",
        phone: "",
        source: "Inbound",
        estimatedValue: undefined,
        currency: "SAR",
        notes: "",
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-nx-surface border-nx-line" dir={isRtl ? "rtl" : "ltr"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading">
              {t("crmLeads.dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmLeads.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="py-2 px-3">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Title / Commercial Subject */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="lead-title" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.titleLabel")} *
              </Label>
              <Input
                id="lead-title"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                }}
                placeholder={t("crmLeads.dialog.titlePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "lead-title-error" : undefined}
                autoFocus
              />
              {errors.title && (
                <p id="lead-title-error" className="text-[11px] text-destructive">
                  {errors.title}
                </p>
              )}
            </div>

            {/* D1=B Identity Error */}
            {errors.identity && (
              <div className="sm:col-span-2">
                <p id="lead-identity-error" className="text-[11px] text-destructive">
                  {errors.identity}
                </p>
              </div>
            )}

            {/* Company / Organization */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="lead-company" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.companyLabel")}
              </Label>
              <Input
                id="lead-company"
                value={formData.companyName ?? ""}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, companyName: e.target.value }));
                  if (errors.identity) setErrors((prev) => ({ ...prev, identity: "" }));
                }}
                placeholder={t("crmLeads.dialog.companyPlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                aria-invalid={Boolean(errors.identity)}
                aria-describedby={errors.identity ? "lead-identity-error" : undefined}
              />
            </div>

            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-first-name" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.firstNameLabel")}
              </Label>
              <Input
                id="lead-first-name"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                  if (errors.identity) setErrors((prev) => ({ ...prev, identity: "" }));
                }}
                placeholder={t("crmLeads.dialog.firstNamePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                aria-invalid={Boolean(errors.firstName || errors.identity)}
                aria-describedby={
                  errors.firstName
                    ? "lead-first-name-error"
                    : errors.identity
                    ? "lead-identity-error"
                    : undefined
                }
              />
              {errors.firstName && (
                <p id="lead-first-name-error" className="text-[11px] text-destructive">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-last-name" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.lastNameLabel")}
              </Label>
              <Input
                id="lead-last-name"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                  if (errors.identity) setErrors((prev) => ({ ...prev, identity: "" }));
                }}
                placeholder={t("crmLeads.dialog.lastNamePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                aria-invalid={Boolean(errors.lastName || errors.identity)}
                aria-describedby={
                  errors.lastName
                    ? "lead-last-name-error"
                    : errors.identity
                    ? "lead-identity-error"
                    : undefined
                }
              />
              {errors.lastName && (
                <p id="lead-last-name-error" className="text-[11px] text-destructive">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-email" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.emailLabel")}
              </Label>
              <Input
                id="lead-email"
                type="email"
                value={formData.email ?? ""}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder={t("crmLeads.dialog.emailPlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "lead-email-error" : undefined}
              />
              {errors.email && (
                <p id="lead-email-error" className="text-[11px] text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.phoneLabel")}
              </Label>
              <Input
                id="lead-phone"
                value={formData.phone ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder={t("crmLeads.dialog.phonePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
              />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-source" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.sourceLabel")}
              </Label>
              <Input
                id="lead-source"
                value={formData.source ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, source: e.target.value }))
                }
                placeholder={t("crmLeads.dialog.sourcePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
              />
            </div>

            {/* Estimated Value */}
            <div className="space-y-1.5">
              <Label htmlFor="lead-value" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.estimatedValueLabel")} ({formData.currency})
              </Label>
              <Input
                id="lead-value"
                type="number"
                min="0"
                step="any"
                value={formData.estimatedValue !== undefined ? formData.estimatedValue : ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    estimatedValue: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder={t("crmLeads.dialog.estimatedValuePlaceholder")}
                className="h-9 text-xs border-nx-line bg-nx-ground text-nx-ink"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="lead-notes" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.notesLabel")}
              </Label>
              <Textarea
                id="lead-notes"
                rows={3}
                value={formData.notes ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder={t("crmLeads.dialog.notesPlaceholder")}
                className="text-xs border-nx-line bg-nx-ground text-nx-ink resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-nx-line gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink"
            >
              {t("crmLeads.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-bold hover:brightness-105"
            >
              {isSubmitting ? t("crmLeads.actions.creating") : t("crmLeads.actions.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
