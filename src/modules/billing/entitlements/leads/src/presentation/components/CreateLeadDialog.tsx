"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
import { PlusCircle } from "lucide-react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { CreateLeadCustomFieldsSection } from "./CreateLeadCustomFieldsSection";

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
  customFieldConfigs: FieldConfig[];
  customFieldsLoading: boolean;
  customFieldValues: Record<string, unknown>;
  onCustomFieldChange: (name: string, value: unknown) => void;
  onCustomFieldsCreated: () => void;
}

// react-hook-form owns every field as a plain string (optional fields default
// to ""), so the trim()/undefined mapping into CreateLeadFormData happens
// once, at submit — the same place the hand-rolled version did it.
interface CreateLeadFormValues {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  editionKey: string;
  message: string;
  notes: string;
}

const EMPTY_VALUES: CreateLeadFormValues = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  editionKey: "",
  message: "",
  notes: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Built once per render with the live t() so every message re-localizes on a
// language switch, same shape as the CommissionRateConfig / signup-content
// dialogs already do.
function buildSchema(t: (key: string) => string) {
  return z.object({
    companyName: z.string().trim().min(1, t("leads.createDialog.errors.companyRequired")),
    contactName: z.string().trim().min(1, t("leads.createDialog.errors.contactRequired")),
    email: z.string().trim().regex(EMAIL_PATTERN, t("leads.createDialog.errors.emailInvalid")),
    // Phone stays optional: empty passes, and only a non-empty value is
    // checked against the phone library — identical to the manual
    // `form.phone?.trim() && !isValidPhoneNumber(form.phone)` guard.
    phone: z.string().refine((value) => !value.trim() || isValidPhoneNumber(value), {
      message: t("leads.createDialog.errors.phoneInvalid"),
    }),
    editionKey: z.string(),
    message: z.string(),
    notes: z.string(),
  });
}

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
  customFieldConfigs,
  customFieldsLoading,
  customFieldValues,
  onCustomFieldChange,
  onCustomFieldsCreated,
}: CreateLeadDialogProps) {
  const { t } = useI18n();
  const schema = useMemo(() => buildSchema(t), [t]);

  const form = useForm<CreateLeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  const handleClose = () => {
    if (isSubmitting) return;
    form.reset(EMPTY_VALUES);
    onClose();
  };

  const handleValid = async (values: CreateLeadFormValues) => {
    await onSubmit({
      companyName: values.companyName,
      contactName: values.contactName,
      email: values.email,
      phone: values.phone.trim() || undefined,
      editionKey: values.editionKey || undefined,
      message: values.message.trim() || undefined,
      notes: values.notes.trim() || undefined,
    });
    form.reset(EMPTY_VALUES);
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
              <PlusCircle className="h-5 w-5 text-info" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle>{t("leads.createDialog.title")}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("leads.createDialog.subtitle")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleValid)} className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("leads.createDialog.company")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("leads.createDialog.companyPlaceholder")}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("leads.createDialog.contact")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("leads.createDialog.contactPlaceholder")}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("leads.createDialog.email")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@company.com"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PhoneInput drives its own error skin from the `error` string
                  prop, not from aria-invalid, so this field intentionally
                  stays outside FormControl and hands fieldState's message to
                  it directly — that prop wiring must not change. */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="cl-phone">{t("leads.createDialog.phone")}</FormLabel>
                    <PhoneInput
                      id="cl-phone"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                      error={fieldState.error?.message}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {availableEditions.length > 0 && (
              <FormField
                control={form.control}
                name="editionKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="cl-edition">
                      {t("leads.createDialog.editionInterest")}
                    </FormLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger id="cl-edition">
                          <SelectValue placeholder={t("leads.createDialog.editionPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t("leads.createDialog.editionNone")}</SelectItem>
                        {availableEditions.map((edition) => (
                          <SelectItem key={edition.key} value={edition.key}>
                            {edition.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("leads.createDialog.message")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("leads.createDialog.messagePlaceholder")}
                      rows={3}
                      className="resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("leads.createDialog.notes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("leads.createDialog.notesPlaceholder")}
                      rows={2}
                      className="resize-none"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <CreateLeadCustomFieldsSection
              customFieldConfigs={customFieldConfigs}
              customFieldsLoading={customFieldsLoading}
              customFieldValues={customFieldValues}
              onCustomFieldChange={onCustomFieldChange}
              onCustomFieldsCreated={onCustomFieldsCreated}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                {t("leads.createDialog.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? t("leads.createDialog.creating") : t("leads.createDialog.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
