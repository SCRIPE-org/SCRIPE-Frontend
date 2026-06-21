"use client";

import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface UseAddMembersViewModelProps {
  groupId: string;
  tenantId?: string;
  open: boolean;
}

export function useAddMembersViewModel({ groupId, tenantId, open }: UseAddMembersViewModelProps) {
  const { t, language } = useI18n();

  // Fetch all admins (scoped to tenant if specified)
  const { data: adminsData, isLoading } = useQuery({
    queryKey: ["admins-for-group", groupId, tenantId],
    queryFn: () =>
      tenantId
        ? identityContainer.adminRepository.getByTenantId(tenantId, {
            page: 1,
            pageSize: 100,
            isActive: true,
          })
        : identityContainer.adminRepository.getAll({
            page: 1,
            pageSize: 100,
            isActive: true,
          }),
    enabled: open,
  });

  return {
    t,
    language,
    adminsData,
    isLoading,
  };
}
