"use client";

import { useMemo, useState } from "react";
import { NonModalScrim } from "@core/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetPortal, SheetTitle } from "@core/ui/sheet";
import { ScrollArea } from "@core/ui/scroll-area";
import { Button } from "@core/ui/button";
import { GenericForm } from "@core/ui/forms/generic-form";
import { usePermission } from "@core/hooks/use-permission";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { useFieldGroupOptions } from "../../../../field-group/src/presentation/viewmodels/useFieldGroupOptions";
import {
  REFERENCE_TARGET_FIELD_NAME,
  UNPINNED_REFERENCE_TARGET,
} from "../../../../custom-field/src/presentation/form/referenceTargetFieldConfig";
import { getInitialCustomFieldScope } from "../../../../custom-field/src/presentation/form/customFieldScopeFieldConfig";
import { useEntityLookupAvailableTypes } from "../../../../entity-lookup/src/presentation/hooks/useEntityLookupAvailableTypes";
import { useOptionSetViewModel } from "../../../../option-set/src/presentation/viewmodels/useOptionSetViewModel";
import { useInlineAddCustomFieldViewModel } from "../viewmodels/useInlineAddCustomFieldViewModel";
import { useInlineAddCustomFieldFormFields } from "../viewmodels/useInlineAddCustomFieldFormFields";

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
  // Verified field visibility fallbacks (delegated to useInlineAddCustomFieldFormFields.ts):
  // 1. placeholderEn: hasPlaceholder ?? true
  // 2. placeholderAr: hasPlaceholder ?? true
  // 3. options: hasOptions ?? false
  // 4. optionSetId: hasOptions ?? false
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  useModuleLocales(() => import("../../../../custom-field/locales"), "customFields");
  const { t, language } = useI18n();
  const { createInlineCustomField } = useInlineAddCustomFieldViewModel();
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
  const canViewOptionSets = usePermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW) || isSuperAdmin;
  const canBindOptionSets = usePermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND) || isSuperAdmin;
  const optionSets = useOptionSetViewModel(null);
  const bindableOptionSets = useMemo(
    () => optionSets.sets.filter((set) => set.isBindable),
    [optionSets.sets]
  );

  const fields = useInlineAddCustomFieldFormFields({
    t,
    language,
    isPlatformContext,
    canViewFieldGroups,
    fieldGroupOptions,
    isFieldGroupsLoading,
    isFieldGroupsError,
    referenceTargetTypes,
    isReferenceTargetTypesLoading,
    isReferenceTargetTypesError,
    isReferenceTargetTypesEmpty,
    canViewOptionSets,
    canBindOptionSets,
    bindableOptionSets,
  });

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
                  await createInlineCustomField({
                    data: data as Record<string, unknown>,
                    entityTypeKey,
                    bindableOptionSets,
                    onSuccess: () => {
                      setOpen(false);
                      onCreated();
                    },
                  });
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
