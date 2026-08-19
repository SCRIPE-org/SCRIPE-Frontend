"use client";

import { useMemo, useState } from "react";
import { NonModalScrim } from "@core/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetPortal, SheetTitle } from "@core/ui/sheet";
import { ScrollArea } from "@core/ui/scroll-area";
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
import {
  VALIDATOR_KIND_CATALOG,
  ALL_VALIDATOR_KINDS,
} from "../../../../custom-field/src/presentation/validatorKindRegistry";

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

  // Wave 2 Step 2.5 Task 10 (D5: admin-definition-form only). Same catalog-
  // driven shape as CustomFieldListView.tsx's identical construction --
  // kept in sync deliberately, not shared/imported, matching this file's
  // existing convention for its other per-value-type field logic.
  const validatorKindOptions = useMemo(
    () => [
      { value: "", label: t("customField.validatorKindNone") },
      ...ALL_VALIDATOR_KINDS.map((kind) => ({
        value: kind,
        label: t(VALIDATOR_KIND_CATALOG[kind].labelKey),
      })),
    ],
    [t]
  );

  const validatorParamFields = useMemo<FieldConfig[]>(
    () =>
      ALL_VALIDATOR_KINDS.filter((kind) => VALIDATOR_KIND_CATALOG[kind].hasParam).map((kind) => {
        const entry = VALIDATOR_KIND_CATALOG[kind];
        const isClosedSet = entry.supportedParamValues !== undefined;
        return {
          name: "validatorParam",
          label: t("customField.fields.validatorParam"),
          type: isClosedSet ? "select" : "text",
          placeholder: isClosedSet ? undefined : t(entry.paramHintKey as string),
          description: t(entry.paramHintKey as string),
          options: isClosedSet
            ? entry.supportedParamValues!.map((code) => ({ value: code, label: code }))
            : undefined,
          isVisible: (form) => form.valueType === "Text" && form.validatorKind === kind,
        };
      }),
    [t]
  );

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
        name: "validatorKind",
        label: t("customField.fields.validatorKind"),
        type: "select",
        options: validatorKindOptions,
        description: t("customField.validatorKindDescription"),
        // D5/D4: admin-definition-form only, Text value type only. Literal
        // "Text" comparison -- see CustomFieldListView.tsx's identical field
        // for the full reasoning.
        isVisible: (form) => form.valueType === "Text",
      },
      ...validatorParamFields,
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
    [t, isSuperAdmin, isPlatformContext, validatorKindOptions, validatorParamFields]
  );

  if (!canCreate) return null;

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {t("customField.inlineAdd.trigger")}
      </Button>
      {/*
       * Wave 5 row 5.6 (design spec §5.4, ruling #1/#2; pre-plan R2/R3): this
       * used to be a bare `<Dialog>` -- Radix default `modal={true}` -- that
       * nested inside every host record form this trigger mounts in (~30
       * GenericCrudView screens via CustomFieldsExtensionTrigger, plus the
       * bespoke screens that consume InlineAddTrigger directly). The host is
       * either GenericModal (already `modal={false}`, deliberately, see
       * generic-modal.tsx:148) or one of the four hand-rolled dialogs fixed
       * alongside this one -- either way, a `modal={true}` dialog trapping
       * focus *inside itself* here fought the host's own FocusScope/
       * hideOthers state the moment both were open, which is the literal
       * defect: "two dialogs, two close buttons, two scroll containers".
       *
       * Two changes, not one:
       *  - `modal={false}` on this Sheet, matching every other non-modal
       *    container in the family. Radix skips its own overlay in this mode
       *    (SheetOverlay returns null when context.modal is false), so
       *    NonModalScrim re-adds it by hand from the SAME shared recipe
       *    GenericModal originated (core/ui/dialog.tsx).
       *  - A Sheet instead of a centered Dialog: the design spec's own
       *    ruling is that field-definition authoring should not be a dialog
       *    launched from a record form at all, ideally its own route. A full
       *    route is disproportionate here specifically -- it would discard
       *    whatever the admin has already typed into the host record form --
       *    which is exactly the case R3 names for falling back to
       *    core/ui/sheet.tsx's non-modal side panel instead of a route.
       */}
      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetPortal>
          <NonModalScrim open={open} />
        </SheetPortal>
        <SheetContent
          side="end"
          aria-describedby={undefined}
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          <SheetHeader className="shrink-0 border-b border-nx-line px-6 py-5">
            <SheetTitle>
              {t("customField.inlineAdd.dialogTitle", { entity: entityDisplayName || entityTypeKey })}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="px-6 py-6">
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
                  await customFieldRepository.create({
                    ...data,
                    entityTypeKey,
                    // Wave 2 Step 2.5 Task 10 (TRAP 1), this dialog's own write
                    // seam (R4). `validatorKind` is a nullable enum on the wire
                    // -- "" is neither JSON null nor a member name, so it fails
                    // model binding outright, unlike `options` (a plain
                    // `string?`) which survives "" today. The picker's "no
                    // validator" option submits "" when chosen, and
                    // generic-form.tsx's submitData is a raw spread of formData
                    // with no per-field coercion beyond dates/numbers, so ""
                    // reaches here verbatim unless normalized right before this
                    // call -- the only seam this dialog owns.
                    validatorKind: data.validatorKind === "" ? null : data.validatorKind,
                    validatorParam: data.validatorParam === "" ? null : data.validatorParam,
                  });
                  setOpen(false);
                  onCreated();
                }}
                onCancel={() => setOpen(false)}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
