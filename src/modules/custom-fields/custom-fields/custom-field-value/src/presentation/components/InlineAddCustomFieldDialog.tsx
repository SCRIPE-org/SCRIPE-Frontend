"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { getCustomFieldsContainer } from "../../../../di";
import {
  VALUE_TYPE_CATALOG,
  ALL_VALUE_TYPES,
  type CustomFieldValueTypeName,
} from "../../../../custom-field/src/presentation/valueTypeRegistry";

// Shares CustomFieldListView.tsx's per-value-type catalog (badge tone,
// placeholder/options applicability, display label) rather than
// re-declaring its own copy of SELECT_VALUE_TYPE/NO_PLACEHOLDER_VALUE_TYPES/
// the option array -- these were previously two independently-maintained
// hardcoded lists for the same backend enum, with nothing enforcing they
// stayed in sync (Wave 2 Step 2.2, D4).

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
  const { isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();
  // Same reasoning as CustomFieldListView.tsx's own isPlatformContext: with
  // no tenant drilled into, there's no tenant to scope a new definition to,
  // so it's always global regardless of the switch below.
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;
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
        options: ALL_VALUE_TYPES.map((type) => ({ value: type, label: t(VALUE_TYPE_CATALOG[type].labelKey) })),
      },
      {
        name: "placeholderEn",
        label: t("customField.fields.placeholderEn"),
        type: "text",
        placeholder: t("customField.placeholders.placeholderEn"),
        // A miss (unset/invalid valueType, e.g. before the user has picked
        // one yet) falls back to `true` -- matches the old
        // `!NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType))`, which
        // evaluated to `true` (show) for an unset value.
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
      },
      {
        name: "placeholderAr",
        label: t("customField.fields.placeholderAr"),
        type: "text",
        placeholder: t("customField.placeholders.placeholderAr"),
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
      },
      {
        name: "options",
        label: t("customField.fields.options"),
        type: "textarea",
        placeholder: t("customField.placeholders.options"),
        rows: 4,
        // A miss falls back to `false` -- matches the old
        // `String(form.valueType) === SELECT_VALUE_TYPE`, which was already
        // `false` (hide) for an unset value.
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
      },
      { name: "isRequired", label: t("customField.fields.isRequired"), type: "switch" },
      { name: "sortOrder", label: t("customField.fields.sortOrder"), type: "number", min: 0 },
      {
        name: "isGlobal",
        label: t("customField.fields.isGlobal"),
        type: "switch",
        // See CustomFieldListView.tsx's identical field for the full
        // reasoning — kept in sync deliberately, not shared/imported.
        isVisible: () => isSuperAdmin,
        disabled: isPlatformContext,
        description: isPlatformContext
          ? t("customField.isGlobalDescription.platformContext")
          : t("customField.isGlobalDescription.tenantContext"),
      },
    ],
    [t, isSuperAdmin, isPlatformContext]
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
            initialValues={{
              valueType: "Text",
              placeholderEn: "",
              placeholderAr: "",
              isRequired: false,
              sortOrder: 0,
              isGlobal: isPlatformContext,
            }}
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
