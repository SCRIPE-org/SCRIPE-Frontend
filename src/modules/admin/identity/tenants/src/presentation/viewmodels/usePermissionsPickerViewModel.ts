"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

/**
 * React hook/ViewModel orchestrating state and data flows for permissions picker view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function usePermissionsPickerViewModel() {
  const { t, language } = useI18n();
  const { permissionRepository } = identityContainer;

  // Fetch creator's permissions via Repository
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions", "my"],
    queryFn: () => permissionRepository.getMyPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    t,
    language,
    permissions,
    isLoading,
  };
}
