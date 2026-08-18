/**
 * CustomField ViewModel
 *
 * Handles state management for the CustomField list view and entity-types discovery query.
 * Uses useCrudViewModel for standard CRUD operations and TanStack Query for caching entity types.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { getCustomFieldsContainer } from "../../../../di";
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

  const vm = useCrudViewModel(["customField"], {
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
        normalizeValidatorFields(data as Record<string, unknown>)
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

  return { vm, entityTypes, isEntityTypesLoading, isEntityTypesError, refetchEntityTypes };
}
