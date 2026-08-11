"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { getCustomFieldsContainer } from "../../../../di";

// Matches CustomFieldListView.tsx's own constant — same enum, same rule
// (Options only applies to Select fields), kept in sync deliberately rather
// than imported: these are two independent forms for the same backend
// command, not a shared component.
const SELECT_VALUE_TYPE = "4";

export function InlineAddCustomFieldDialog({
  entityTypeKey,
  entityDisplayName,
  onCreated,
}: {
  entityTypeKey: string;
  entityDisplayName?: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const canCreate = usePermission("custom-fields.create");
  // The "customField" translation namespace is owned by the definitions
  // screen (CustomFieldListView), not this one — this dialog can mount
  // inside any other module's form, which never loads it on its own.
  // Idempotent: a no-op if the definitions screen already loaded it this
  // session.
  useModuleLocales(() => import("../../../../custom-field/locales"), "customFields");
  const { t } = useI18n();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: "key",
        label: t("customField.fields.key"),
        type: "text",
        placeholder: t("customField.placeholders.key"),
        required: true,
      },
      {
        name: "labelEn",
        label: t("customField.fields.labelEn"),
        type: "text",
        placeholder: t("customField.placeholders.labelEn"),
        required: true,
      },
      {
        name: "labelAr",
        label: t("customField.fields.labelAr"),
        type: "text",
        placeholder: t("customField.placeholders.labelAr"),
      },
      {
        name: "valueType",
        label: t("customField.fields.valueType"),
        type: "select",
        required: true,
        options: [
          { value: "0", label: t("customField.valueTypes.text") },
          { value: "1", label: t("customField.valueTypes.number") },
          { value: "2", label: t("customField.valueTypes.boolean") },
          { value: "3", label: t("customField.valueTypes.date") },
          { value: "4", label: t("customField.valueTypes.select") },
        ],
      },
      {
        name: "options",
        label: t("customField.fields.options"),
        type: "textarea",
        placeholder: t("customField.placeholders.options"),
        rows: 4,
        isVisible: (form) => String(form.valueType) === SELECT_VALUE_TYPE,
      },
      { name: "isRequired", label: t("customField.fields.isRequired"), type: "switch" },
      { name: "sortOrder", label: t("customField.fields.sortOrder"), type: "number", min: 0 },
    ],
    [t]
  );

  if (!canCreate) return null;

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {t("customField.inlineAdd.trigger")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("customField.inlineAdd.dialogTitle", { entity: entityDisplayName || entityTypeKey })}
            </DialogTitle>
          </DialogHeader>
          <GenericForm
            fields={fields}
            initialValues={{ valueType: "0", isRequired: false, sortOrder: 0 }}
            onSubmit={async (data) => {
              const { customFieldRepository } = getCustomFieldsContainer();
              await customFieldRepository.create({ ...data, entityTypeKey });
              setOpen(false);
              onCreated();
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
