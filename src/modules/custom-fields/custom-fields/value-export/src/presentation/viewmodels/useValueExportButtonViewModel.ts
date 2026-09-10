/**
 * ViewModel hook for ValueExportButton.
 * Encapsulates entity-types query and permission gating.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import { usePermissions } from "@core/hooks/use-permission";
import { getCustomFieldsContainer } from "../../../../di";
import { isEntityTypeViewableForValueExport } from "./useValueExportViewModel";

export function useValueExportButtonViewModel() {
  const { has: hasPermission } = usePermissions();
  const { customFieldRepository } = getCustomFieldsContainer();

  const { data: entityTypes } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
  });

  const canExport =
    entityTypes?.some((item) => isEntityTypeViewableForValueExport(item, hasPermission)) ?? false;

  return { canExport };
}
