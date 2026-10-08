/**
 * CreateLeadDialog — Modal dialog for capturing and qualifying incoming sales leads.
 * Orchestrates form validation, edition selection, and dynamic custom fields.
 */

"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  NonModalScrim,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Form } from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
import { PlusCircle } from "lucide-react";
import type { FieldConfig } from "@core/ui/forms/generic-form";
import { CreateLeadCustomFieldsSection } from "./CreateLeadCustomFieldsSection";
import {
  type CreateLeadFormData,
  type CreateLeadFormValues,
  EMPTY_VALUES,
  buildSchema,
} from "./CreateLeadDialogSchema";
import { CreateLeadFormFields } from "./CreateLeadFormFields";

/**
 * Documentation for module export
 */
export type { CreateLeadFormData };

/**
 * Props for the lead creation dialog modal.
 */
interface CreateLeadDialogProps {
  /** Visibility toggle state */
  open: boolean;
  /** Modal close callback */
  onClose: () => void;
  /** Submission handler receiving validated lead payload */
  onSubmit: (data: CreateLeadFormData) => Promise<void>;
  /** Asynchronous pending submission indicator */
  isSubmitting: boolean;
  /** Available editions configured on the platform */
  availableEditions: Array<{ key: string; displayName: string }>;
  /** Metadata definitions for dynamic custom fields */
  customFieldConfigs: FieldConfig[];
  /** Loading state for custom field schema resolution */
  customFieldsLoading: boolean;
  /** Current values dictionary for custom fields */
  customFieldValues: Record<string, unknown>;
  /** Change callback for custom field values */
  onCustomFieldChange: (name: string, value: unknown) => void;
  /** Refresh trigger when new custom field attributes are registered inline */
  onCustomFieldsCreated: () => void;
}

/**
 * Modal dialog presenting lead capture forms and custom field attachments.
 *
 * @param props Dialog control properties, available editions, and custom field delegates.
 * @returns Dialog portal containing accessible form controls.
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
      modal={false}
    >
      <DialogPortal>
        <NonModalScrim open={open} />
      </DialogPortal>
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
            <CreateLeadFormFields
              control={form.control}
              isSubmitting={isSubmitting}
              availableEditions={availableEditions}
              t={t}
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
