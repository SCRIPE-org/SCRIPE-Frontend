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
  VALIDATOR_KIND_CATALOG,
  ALL_VALIDATOR_KINDS,
} from "../../../../custom-field";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { useFieldGroupOptions } from "../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions";
import {
  buildFieldGroupField,
  makeFieldGroupPickerVisibility,
} from "../../../../custom-field/src/presentation/form/fieldGroupFieldConfig";
import {
  buildReferenceTargetField,
  REFERENCE_TARGET_FIELD_NAME,
  UNPINNED_REFERENCE_TARGET,
} from "../../../../custom-field/src/presentation/form/referenceTargetFieldConfig";
import {
  buildCustomFieldScopeField,
  getInitialCustomFieldScope,
  normalizeCustomFieldCreateScope,
} from "../../../../custom-field/src/presentation/form/customFieldScopeFieldConfig";
import { useEntityLookupAvailableTypes } from "../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes";
import { useOptionSetViewModel } from "../../../../option-set/src/presentation/viewmodels/useOptionSetViewModel";
import { resolveActiveFieldVersion } from "../../../../custom-field/src/presentation/viewmodels/useOptionSetBindingViewModel";
import { toast } from "@core/hooks/use-enhanced-toast";

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
  // Scope is selectable only for a platform Super Admin outside tenant context.
  // Platform-only is the default there; tenant context is always tenant-scoped.
  // The backend independently derives and enforces the same boundary.
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;
  // The "customField" translation namespace is owned by the definitions
  // screen (CustomFieldListView), not this one — this dialog can mount
  // inside any other module's form, which never loads it on its own.
  // Idempotent: a no-op if the definitions screen already loaded it this
  // session.
  useModuleLocales(() => import("../../../../custom-field/locales"), "customFields");
  const { t, language } = useI18n();
  const canViewFieldGroups = usePermission(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_VIEW);
  const {
    options: fieldGroupOptions,
    isLoading: isFieldGroupsLoading,
    isError: isFieldGroupsError,
  } = useFieldGroupOptions(entityTypeKey, { enabled: canViewFieldGroups });
  const {
    types: referenceTargetTypes,
    isLoading: isReferenceTargetTypesLoading,
    isError: isReferenceTargetTypesError,
    isEmpty: isReferenceTargetTypesEmpty,
  } = useEntityLookupAvailableTypes();
  const canViewOptionSets = usePermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW);
  const canBindOptionSets = usePermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND);
  // `null`: this consumer never opens a set's own detail/version-chain view, same reason
  // useOptionSetBindingViewModel passes null -- only the list's `isBindable` flag is read here.
  const optionSets = useOptionSetViewModel(null);
  const bindableOptionSets = useMemo(
    () => optionSets.sets.filter((set) => set.isBindable),
    [optionSets.sets]
  );

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

  // Attaching a shared option set at create time, not just after the fact -- the field editor's
  // own Option Set action (CustomFieldListView) previously required a field to already exist before
  // any set could be attached to it, forcing "create with 3 options, then hunt for a second dialog to
  // attach a set" as two disconnected steps. This form still keeps the manual "options" field above:
  // the backend's bind (OptionSetBindingApplier.ApplyAsync) already merges the two -- hand-typed
  // options are kept unless their key collides with the set -- so picking BOTH is a supported,
  // intended combination, not a UI trick.
  const optionSetOptions = useMemo(
    () => [
      { value: "", label: t("customField.optionSetBinding.noneOption") },
      ...bindableOptionSets.map((set) => ({ value: set.id, label: set.displayLabel(language) })),
    ],
    [t, bindableOptionSets, language]
  );

  const fieldGroupField = useMemo(
    () => ({
      ...buildFieldGroupField({
        t,
        options: fieldGroupOptions,
        isLoading: isFieldGroupsLoading,
        isError: isFieldGroupsError,
      }),
      isVisible: makeFieldGroupPickerVisibility({
        canView: canViewFieldGroups,
        requireEntityType: false,
      }),
    }),
    [t, fieldGroupOptions, isFieldGroupsLoading, isFieldGroupsError, canViewFieldGroups]
  );

  const referenceTargetField = useMemo(
    () =>
      buildReferenceTargetField({
        t,
        language,
        types: referenceTargetTypes,
        isLoading: isReferenceTargetTypesLoading,
        isError: isReferenceTargetTypesError,
        isEmpty: isReferenceTargetTypesEmpty,
        isExistingDefinition: false,
      }),
    [
      t,
      language,
      referenceTargetTypes,
      isReferenceTargetTypesLoading,
      isReferenceTargetTypesError,
      isReferenceTargetTypesEmpty,
    ]
  );

  const classificationFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: "sensitivity",
        label: t("customField.fields.sensitivity"),
        type: "select",
        section: t("customField.formSections.governance"),
        options: [
          { value: "None", label: t("customField.sensitivity.none") },
          { value: "Internal", label: t("customField.sensitivity.internal") },
          { value: "Confidential", label: t("customField.sensitivity.confidential") },
          { value: "Restricted", label: t("customField.sensitivity.restricted") },
        ],
        description: t("customField.hints.sensitivity"),
      },
      {
        name: "isExportable",
        label: t("customField.fields.isExportable"),
        type: "switch",
        section: t("customField.formSections.governance"),
        description: t("customField.hints.isExportable"),
      },
    ],
    [t]
  );

  const scopeField = useMemo(
    () => ({
      ...buildCustomFieldScopeField({ t, isPlatformContext }),
      section: t("customField.formSections.governance"),
    }),
    [t, isPlatformContext]
  );

  const fields = useMemo<FieldConfig[]>(
    () => [
      // 1. Basic Information
      {
        name: "key",
        label: t("customField.fields.key"),
        type: "text",
        section: t("customField.formSections.identity"),
        placeholder: t("customField.placeholders.key"),
        required: true,
      },
      {
        name: "labelEn",
        label: t("customField.fields.labelEn"),
        type: "text",
        section: t("customField.formSections.identity"),
        placeholder: t("customField.placeholders.labelEn"),
        required: true,
      },
      {
        name: "labelAr",
        label: t("customField.fields.labelAr"),
        type: "text",
        section: t("customField.formSections.identity"),
        placeholder: t("customField.placeholders.labelAr"),
      },
      // 2. Data Type & Validation
      {
        name: "valueType",
        label: t("customField.fields.valueType"),
        type: "select",
        section: t("customField.formSections.typeAndValidation"),
        required: true,
        options: ALL_VALUE_TYPES.map((type) => ({
          value: type,
          label: t(VALUE_TYPE_CATALOG[type].labelKey),
        })),
      },
      {
        name: "placeholderEn",
        label: t("customField.fields.placeholderEn"),
        type: "text",
        section: t("customField.formSections.typeAndValidation"),
        placeholder: t("customField.placeholders.placeholderEn"),
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
      },
      {
        name: "placeholderAr",
        label: t("customField.fields.placeholderAr"),
        type: "text",
        section: t("customField.formSections.typeAndValidation"),
        placeholder: t("customField.placeholders.placeholderAr"),
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true,
      },
      {
        name: "validatorKind",
        label: t("customField.fields.validatorKind"),
        type: "select",
        section: t("customField.formSections.typeAndValidation"),
        options: validatorKindOptions,
        description: t("customField.validatorKindDescription"),
        isVisible: (form) => form.valueType === "Text",
      },
      ...validatorParamFields.map((f) => ({
        ...f,
        section: t("customField.formSections.typeAndValidation"),
      })),
      {
        ...referenceTargetField,
        section: t("customField.formSections.typeAndValidation"),
      },
      {
        name: "options",
        label: t("customField.fields.options"),
        type: "bilingual-options",
        section: t("customField.formSections.typeAndValidation"),
        pairedName: "optionsAr",
        placeholder: t("customField.placeholders.optionEn"),
        searchPlaceholder: t("customField.placeholders.optionAr"),
        addLabel: t("customField.actions.addOption"),
        removeLabel: t("customField.actions.removeOption"),
        emptyHint: t("customField.placeholders.optionsEmpty"),
        isVisible: (form) =>
          VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false,
      },
      {
        name: "optionSetId",
        label: t("customField.optionSetBinding.pickerLabel"),
        type: "select",
        section: t("customField.formSections.typeAndValidation"),
        options: optionSetOptions,
        description: t("customField.optionSetBinding.attachAtCreateHint"),
        isVisible: (form) =>
          canViewOptionSets &&
          canBindOptionSets &&
          (VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false),
      },
      // 3. Organization & Grouping
      {
        ...fieldGroupField,
        section: t("customField.formSections.layout"),
      },
      {
        name: "sortOrder",
        label: t("customField.fields.sortOrder"),
        type: "number",
        section: t("customField.formSections.layout"),
        min: 0,
      },
      // 4. Behavior & Governance
      {
        name: "isRequired",
        label: t("customField.fields.isRequired"),
        type: "switch",
        section: t("customField.formSections.governance"),
      },
      ...classificationFields,
      scopeField,
    ],
    [
      t,
      validatorKindOptions,
      validatorParamFields,
      referenceTargetField,
      optionSetOptions,
      canViewOptionSets,
      canBindOptionSets,
      fieldGroupField,
      classificationFields,
      scopeField,
    ]
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
                  options: "",
                  optionsAr: "",
                  validatorKind: "",
                  validatorParam: "",
                  [REFERENCE_TARGET_FIELD_NAME]: UNPINNED_REFERENCE_TARGET,
                  optionSetId: "",
                  fieldGroupId: "",
                  sensitivity: "None",
                  isExportable: true,
                  isRequired: false,
                  sortOrder: 0,
                  scope: getInitialCustomFieldScope(isPlatformContext),
                }}
                onSubmit={async (data) => {
                  const { customFieldRepository, optionSetRepository } = getCustomFieldsContainer();
                  const { optionSetId, ...rest } = data as Record<string, unknown> & {
                    optionSetId?: string;
                  };
                  const fieldId = await customFieldRepository.create(
                    normalizeCustomFieldCreateScope({
                      ...rest,
                      entityTypeKey,
                      validatorKind: rest.validatorKind === "" ? null : rest.validatorKind,
                      validatorParam: rest.validatorParam === "" ? null : rest.validatorParam,
                    })
                  );

                  // Attach the chosen option set AFTER the field exists -- binding targets a
                  // FieldVersionId, which only exists once the create handler has minted the
                  // field's definition twin and Published version. The manual "options" this admin
                  // may have just typed are kept: OptionSetBindingApplier.ApplyAsync preserves any
                  // hand-authored option whose key doesn't collide with the set.
                  if (optionSetId) {
                    const chosen = bindableOptionSets.find((set) => set.id === optionSetId);
                    if (chosen?.publishedVersionId) {
                      try {
                        const { versions } = await customFieldRepository.getVersions(fieldId);
                        const active = resolveActiveFieldVersion(versions);
                        if (active) {
                          await optionSetRepository.bind(active.id, chosen.publishedVersionId);
                        }
                      } catch {
                        // The field itself was created successfully -- this create flow must not
                        // roll it back over a binding failure. The admin can attach the set from
                        // the field's own "Option set" action afterward; the toast says so rather
                        // than leaving them to notice the set silently never applied.
                        toast.error({
                          title: t("customField.optionSetBinding.attachAtCreateFailed"),
                        });
                      }
                    }
                  }

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
