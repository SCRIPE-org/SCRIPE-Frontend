"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { getCustomFieldsContainer } from "../../../../di";

const SELECT_VALUE_TYPE = "4";

const FIELDS: FieldConfig[] = [
  { name: "key", label: "Key", type: "text", required: true },
  { name: "labelEn", label: "Label (EN)", type: "text", required: true },
  { name: "labelAr", label: "Label (AR)", type: "text" },
  {
    name: "valueType",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { value: "0", label: "Text" },
      { value: "1", label: "Number" },
      { value: "2", label: "Boolean" },
      { value: "3", label: "Date" },
      { value: "4", label: "Select" },
    ],
  },
  {
    name: "options",
    label: "Options (one per line)",
    type: "textarea",
    rows: 4,
    isVisible: (form) => String(form.valueType) === SELECT_VALUE_TYPE,
  },
  { name: "isRequired", label: "Required", type: "switch" },
  { name: "sortOrder", label: "Sort Order", type: "number", min: 0 },
];

export function InlineAddCustomFieldDialog({
  entityTypeKey,
  onCreated,
}: {
  entityTypeKey: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const canCreate = usePermission("custom-fields.create");

  if (!canCreate) return null;

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Add custom field
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add custom field — {entityTypeKey}</DialogTitle>
          </DialogHeader>
          <GenericForm
            fields={FIELDS}
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
