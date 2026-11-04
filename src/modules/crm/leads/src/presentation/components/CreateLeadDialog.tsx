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
import { PhoneInput } from "@core/ui/phone-input";
import { Textarea } from "@core/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import type { CreateLeadInput } from "../../domain/entities/LeadEntity";

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    input: CreateLeadInput,
    customFieldValues?: Record<string, unknown>
  ) => Promise<boolean>;
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

  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("Inbound");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [currency, setCurrency] = useState("SAR");
  const [notes, setNotes] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});

  const resetForm = () => {
    setTitle("");
    setFirstName("");
    setLastName("");
    setCompanyName("");
    setEmail("");
    setPhone("");
    setSource("Inbound");
    setEstimatedValue("");
    setCurrency("SAR");
    setNotes("");
    setCustomFields({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !firstName.trim()) {
      return;
    }

    const parsedValue = estimatedValue ? parseFloat(estimatedValue) : undefined;

    const success = await onSubmit(
      {
        title: title.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        source: source.trim() || undefined,
        estimatedValue:
          parsedValue && !Number.isNaN(parsedValue) ? parsedValue : undefined,
        currency,
        notes: notes.trim() || undefined,
      },
      customFields
    );

    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg bg-nx-surface border-nx-line max-h-[90vh] overflow-y-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
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

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="lead-title" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.titleLabel")} *
              </Label>
              <Input
                id="lead-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("crmLeads.dialog.titlePlaceholder")}
                required
                className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead-firstName" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.firstNameLabel")} *
                </Label>
                <Input
                  id="lead-firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("crmLeads.dialog.firstNamePlaceholder")}
                  required
                  className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-lastName" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.lastNameLabel")}
                </Label>
                <Input
                  id="lead-lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("crmLeads.dialog.lastNamePlaceholder")}
                  className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead-company" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.companyLabel")}
                </Label>
                <Input
                  id="lead-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t("crmLeads.dialog.companyPlaceholder")}
                  className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-source" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.sourceLabel")}
                </Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inbound">Inbound</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="DirectOutreach">Direct Outreach</SelectItem>
                    <SelectItem value="Event">Event / Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lead-email" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.emailLabel")}
                </Label>
                <Input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("crmLeads.dialog.emailPlaceholder")}
                  className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-phone" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.phoneLabel")}
                </Label>
                <PhoneInput
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  defaultCountry="SA"
                  disabled={isSubmitting}
                  placeholder="5X XXX XXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="lead-value" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.estimatedValueLabel")}
                </Label>
                <Input
                  id="lead-value"
                  type="number"
                  min="0"
                  step="any"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder={t("crmLeads.dialog.estimatedValuePlaceholder")}
                  className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-currency" className="text-xs font-semibold text-nx-ink">
                  {t("crmLeads.dialog.currencyLabel")}
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-8 text-xs border-nx-line bg-nx-ground text-nx-ink">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="EGP">EGP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lead-notes" className="text-xs font-semibold text-nx-ink">
                {t("crmLeads.dialog.notesLabel")}
              </Label>
              <Textarea
                id="lead-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("crmLeads.dialog.notesPlaceholder")}
                className="text-xs border-nx-line bg-nx-ground text-nx-ink resize-none"
              />
            </div>

            <CustomFieldsSection
              entityTypeKey="crm.lead"
              entityDisplayName={t("crmLeads.title") || "Commercial Lead"}
              values={customFields}
              onChange={(key, value) =>
                setCustomFields((prev) => ({ ...prev, [key]: value }))
              }
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-3 border-t border-nx-line gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 text-xs border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
            >
              {t("crmLeads.actions.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim() || !firstName.trim()}
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
