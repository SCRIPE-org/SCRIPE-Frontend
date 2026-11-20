"use client";

import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { PhoneInput } from "@core/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle } from "lucide-react";
import { CustomFieldsSection } from "@core/crud/customFieldsExtension";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { CRM_CURRENCY_OPTIONS } from "@modules/crm";
import type { CrmLead, UpdateLeadInput } from "../../domain/entities/LeadEntity";

/** Props for `EditLeadDetailDialog`. */
export interface EditLeadDetailDialogProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  lead: CrmLead;
  defaultDealCurrency: string;
  isEditOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveLead: (payload: Omit<UpdateLeadInput, "leadId" | "expectedRowVersion">) => Promise<void>;
  submitError: string | null;
  leadCustomFieldConfigs: FieldConfig[];
  isLeadCfLoading: boolean;
  refetchLeadCustomFields: () => Promise<unknown>;
  editCustomFields: Record<string, unknown>;
  onCustomFieldChange: (key: string, value: unknown) => void;
  isSubmitting: boolean;
}

/** Modal dialog for editing a CRM Lead's profile fields and custom attributes. */
export function EditLeadDetailDialog({
  t,
  isRtl,
  lead,
  defaultDealCurrency,
  isEditOpen,
  onOpenChange,
  onSaveLead,
  submitError,
  leadCustomFieldConfigs,
  isLeadCfLoading,
  refetchLeadCustomFields,
  editCustomFields,
  onCustomFieldChange,
  isSubmitting,
}: EditLeadDetailDialogProps) {
  const [editTitle, setEditTitle] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEstimatedValue, setEditEstimatedValue] = useState("");
  const [editCurrency, setEditCurrency] = useState(defaultDealCurrency || "SAR");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (isEditOpen && lead) {
      setEditTitle(lead.title || "");
      setEditFirstName(lead.firstName || "");
      setEditLastName(lead.lastName || "");
      setEditCompany(lead.companyName || "");
      setEditEmail(lead.email || "");
      setEditPhone(lead.phone || "");
      setEditEstimatedValue(lead.estimatedValue != null ? String(lead.estimatedValue) : "");
      setEditCurrency(lead.currency || defaultDealCurrency || "SAR");
      setEditNotes(lead.notes || "");
    }
  }, [isEditOpen, lead, defaultDealCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveLead({
      title: editTitle.trim() || undefined,
      firstName: editFirstName.trim() || undefined,
      lastName: editLastName.trim() || undefined,
      companyName: editCompany.trim() || undefined,
      email: editEmail.trim() || undefined,
      phone: editPhone.trim() || undefined,
      estimatedValue: editEstimatedValue ? Number(editEstimatedValue) : undefined,
      currency: editCurrency,
      notes: editNotes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isEditOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg bg-nx-surface border-nx-line text-nx-ink max-h-[90vh] overflow-y-auto"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-nx-ink font-heading">{t("crmLeads.detail.editDialog.title")}</DialogTitle>
            <DialogDescription className="text-xs text-nx-ink-2">
              {t("crmLeads.detail.editDialog.description")}
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="text-xs py-2">
              <AlertCircle className="size-3.5" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="font-semibold text-nx-ink">{t("crmLeads.detail.editDialog.leadTitleLabel")} *</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.firstNameLabel")}</Label>
                <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.lastNameLabel")}</Label>
                <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.companyLabel")}</Label>
                <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.emailLabel")}</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.phoneLabel")}</Label>
              <PhoneInput value={editPhone} onChange={(val) => setEditPhone(val || "")} defaultCountry="SA" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.estimatedValueLabel")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={editEstimatedValue}
                  onChange={(e) => setEditEstimatedValue(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.currencyLabel")}</Label>
                <Select value={editCurrency} onValueChange={setEditCurrency}>
                  <SelectTrigger className="h-8 text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_CURRENCY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} — {c.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-semibold text-nx-ink">{t("crmLeads.dialog.notesLabel")}</Label>
              <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className="text-xs resize-none" />
            </div>
            <div className="pt-2 border-t border-nx-line">
              <CustomFieldsSection
                entityTypeKey="crm.lead"
                entityDisplayName={t("crmLeads.title")}
                configs={leadCustomFieldConfigs}
                isLoading={isLeadCfLoading}
                onFieldCreated={() => void refetchLeadCustomFields()}
                values={editCustomFields}
                onChange={onCustomFieldChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-nx-line">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="h-8 text-xs">
              {t("crmLeads.actions.cancel")}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold">
              {isSubmitting ? t("crmLeads.detail.editDialog.saving") : t("crmLeads.detail.editDialog.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
