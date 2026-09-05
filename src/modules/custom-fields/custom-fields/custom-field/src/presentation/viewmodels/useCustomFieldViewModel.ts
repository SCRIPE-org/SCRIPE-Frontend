/**
 * CustomField ViewModel
 *
 * Handles state management for the CustomField list view and entity-types discovery query.
 * Uses useCrudViewModel for standard CRUD operations and TanStack Query for caching entity types.
 */
"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { normalizeCustomFieldCreateScope } from "../form/customFieldScopeFieldConfig";
import type { CustomField } from "../../domain/entities/CustomField";

/**
 * Wave 2 Step 2.5 Task 10 (TRAP 1) -- one of the two write seams R4 requires
 * normalization at. `ValidatorKind` is a nullable enum on the wire
 * (`ValidatorKind?`, backed by `JsonStringEnumConverter`): `""` is neither a
 * JSON `null` nor a real member name, so it fails model binding outright --
 * unlike `options`, which survives `""` only because `Options` is a plain
 * `string?` column. `generic-form.tsx`'s `submitData` is a raw spread of
 * `formData` with no per-field type coercion beyond dates/numbers, and the
 * admin picker's "no validator" option (see CustomFieldListView.tsx) submits
 * `""` when chosen, so an unnormalized `""` reaches this seam verbatim on
 * every save where an admin explicitly clears a previously-attached
 * validator. `validatorParam` is normalized alongside it for the same
 * hygiene reason and because Oracle already silently coerces `""` to `NULL`
 * on write (TRAP 5) -- sending `null` explicitly keeps the three providers'
 * observed behavior identical instead of relying on that coercion on only
 * one of them.
 */
export function normalizeValidatorFields(data: Record<string, unknown>): Record<string, unknown> {
  if (data.validatorKind !== "" && data.validatorParam !== "") return data;
  return {
    ...data,
    ...(data.validatorKind === "" ? { validatorKind: null } : {}),
    ...(data.validatorParam === "" ? { validatorParam: null } : {}),
  };
}

export function useCustomFieldViewModel() {
  const { customFieldRepository } = getCustomFieldsContainer();
  const { t } = useI18n();

  const {
    data: entityTypes = [],
    isLoading: isEntityTypesLoading,
    isError: isEntityTypesError,
    refetch: refetchEntityTypes,
  } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60, // Cache entity types for 1 hour
  });

  const baseVm = useCrudViewModel(["customField"], {
    getAll: async (params) => {
      const res = await customFieldRepository.getAll({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
      });
      return {
        items: res.items || [],
        pagination: {
          itemsCount: res.totalCount,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: res.totalPages,
        },
      };
    },
    create: async (data) => {
      const id = await customFieldRepository.create(
        normalizeValidatorFields(
          normalizeCustomFieldCreateScope(data as Record<string, unknown>)
        )
      );
      return { id } as unknown as CustomField;
    },
    update: async (id, data) => {
      await customFieldRepository.update(id, normalizeValidatorFields(data as Record<string, unknown>));
      return { id } as unknown as CustomField;
    },
    delete: async (id) => {
      await customFieldRepository.delete(id);
    },
  });

  const baseOpenEditModal = baseVm.openEditModal;

  /**
   * Wave 2 Step 2.5 fix round, finding C-1 -- the edit modal MUST be populated
   * from a detail fetch, never from the list row the table already has.
   *
   * `useCrudViewModel.openEditModal` is a bare `setEditingItem(item)`, and
   * `generic-crud-view.tsx` hands whatever that stores straight to this
   * screen's `editInitialValues`. The list row is built by
   * `CustomFieldModel.fromListJson` from `CustomFieldListResponse`, which
   * deliberately omits `options`, `placeholderEn`, `placeholderAr`,
   * `validatorKind` and `validatorParam` (ruling R3) -- so every one of those
   * arrived at the form as `null`/`undefined`, was turned into `""` by
   * `buildCustomFieldEditInitialValues`, and was then submitted verbatim
   * (`GenericForm.submitData` is a raw spread of form state; `isVisible`
   * filters rendering, never the payload).
   *
   * `UpdateCustomFieldCommandHandler` assigns all five from the request with
   * no "absent means unchanged" semantics, so the observed effect was:
   *
   *   - renaming a Text field, or toggling `isActive`, silently DETACHED its
   *     validator (clearing a validator is legal by design, so nothing
   *     rejected it) and every later value went unvalidated;
   *   - both placeholders were silently overwritten with `""`;
   *   - a Select field could not be saved at all -- the blanked `options`
   *     tripped `customFields.optionsRequired` and the update 422'd.
   *
   * Fixing it here rather than by adding the two validator columns to
   * `CustomFieldListResponse` (the narrow patch) closes all three at once and
   * leaves no trap for the next form-populating field somebody adds.
   *
   * On a failed fetch the modal is deliberately NOT opened. Falling back to
   * the list row would reinstate exactly the silent data loss above, with the
   * admin given no reason to suspect anything.
   */
  const openEditModal = useCallback(
    async (item: CustomField) => {
      try {
        const detail = await customFieldRepository.getById(item.id);
        baseOpenEditModal(detail);
      } catch {
        toast.error(t("customField.editLoadFailed"));
      }
    },
    [customFieldRepository, baseOpenEditModal, t]
  );

  const vm = useMemo(
    () => ({ ...baseVm, openEditModal }),
    [baseVm, openEditModal]
  );

  return { vm, entityTypes, isEntityTypesLoading, isEntityTypesError, refetchEntityTypes };
}
