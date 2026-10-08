/**
 * useFieldGroupOptions -- Wave 5 row 5.2
 *
 * Read-only hook backing the "Field Group" picker on the custom-field
 * definition form. Shares `useFieldGroupViewModel`'s query key, so the admin
 * screen and the picker never fetch the same list twice.
 *
 * WHY IT TAKES A KEY RATHER THAN READING THE FORM
 * -----------------------------------------------
 * `FieldConfig.options` is a static array evaluated when the config object is
 * built; only `isVisible` receives live form state. The groups shown depend on
 * the field's `entityTypeKey`, so the CALLER must decide which entity type is
 * currently in play (the edit modal's hydrated item, or the create form's
 * current selection) and pass it here.
 *
 * An empty key means "nothing to ask for": the query stays idle and the hook
 * returns just the "no group" sentinel, which is exactly what the create form
 * should show before an entity type has been chosen.
 *
 * WHY THE CALLER CAN DISABLE IT
 * -----------------------------
 * `GET /field-groups` is gated on `custom-field-groups.view`, a permission
 * introduced with this row and therefore absent from every role that predates
 * it. An admin holding the full `custom-fields.*` set without it would hit a
 * 403 on every create/edit modal open -- an avoidable, repeating error state
 * for a role that exists today. The caller passes `enabled: false` in that
 * case and the query never fires.
 */
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { getCustomFieldsContainer } from "../../../../di";
import { fieldGroupsQueryKey } from "./useFieldGroupViewModel";

/**
 * Submitted when the admin picks "no group".
 *
 * `""`, not `null`: `GenericForm` seeds and submits raw form state, and the
 * backend's `CreateCustomFieldCommandHandler`/`UpdateCustomFieldCommandHandler`
 * both branch on `string.IsNullOrEmpty(request.FieldGroupId)`, so an empty
 * string and an absent value mean the identical thing (ungrouped). Unlike
 * `validatorKind` -- a nullable ENUM, which cannot model-bind `""` at all and
 * therefore needs a write-seam null-coercion -- this one needs no
 * normalization.
 */
export const NO_FIELD_GROUP_VALUE = "";

export interface UseFieldGroupOptionsArgs {
  /**
   * Whether the caller may read field groups at all. `false` keeps the query
   * idle -- the hook still returns the sentinel-only option list, so the
   * picker degrades to "no group" rather than to a 403 toast.
   */
  enabled?: boolean;
}

/**
 * Documentation for useFieldGroupOptions
 */
export function useFieldGroupOptions(
  entityTypeKey: string,
  { enabled = true }: UseFieldGroupOptionsArgs = {}
) {
  const { fieldGroupRepository } = getCustomFieldsContainer();
  const { t, language } = useI18n();

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: fieldGroupsQueryKey(entityTypeKey),
    queryFn: () => fieldGroupRepository.getByEntityType(entityTypeKey),
    enabled: enabled && entityTypeKey.length > 0,
  });

  const options = useMemo(
    () => [
      { value: NO_FIELD_GROUP_VALUE, label: t("customField.fieldGroupNone") },
      ...groups.map((group) => ({
        value: group.id,
        label: group.displayLabel(language),
      })),
    ],
    [groups, t, language]
  );

  return { options, groups, isLoading, isError };
}
