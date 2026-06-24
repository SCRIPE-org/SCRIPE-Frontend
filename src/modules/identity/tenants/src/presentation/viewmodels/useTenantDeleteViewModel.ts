"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { identityContainer } from "@modules/identity/di";
import type { Tenant } from "../../domain/entities/Tenant";

interface UseTenantDeleteViewModelProps {
  open: boolean;
  tenant: Tenant | null;
  onConfirm: (cascadeChildren: boolean) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

/**
 * React hook/ViewModel managing logic, state, and repository queries for tenant delete view model.
 */
export function useTenantDeleteViewModel({
  open,
  tenant,
  onConfirm,
  onOpenChange,
}: UseTenantDeleteViewModelProps) {
  const { t } = useI18n();
  const { hasPermission } = usePermissions();
  const [cascadeChildren, setCascadeChildren] = useState(false);

  const canCascadeDelete = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CASCADE_DELETE);

  // Reset cascade checkbox when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCascadeChildren(false);
    }
  }

  // Fetch descendant count when dialog opens
  const { data: descendantCount = 0, isLoading } = useQuery({
    queryKey: ["tenant-descendant-count", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return 0;
      return identityContainer.tenantRepository.getDescendantCount(tenant.id);
    },
    enabled: open && !!tenant?.id,
  });

  const hasDescendants = descendantCount > 0;

  // Disable confirm if has descendants and user hasn't checked cascade (or lacks permission)
  const isConfirmDisabled = hasDescendants && (!canCascadeDelete || !cascadeChildren);

  const handleConfirm = async () => {
    await onConfirm(cascadeChildren);
    onOpenChange(false);
  };

  return {
    t,
    cascadeChildren,
    setCascadeChildren,
    canCascadeDelete,
    descendantCount,
    isLoading,
    hasDescendants,
    isConfirmDisabled,
    handleConfirm,
  };
}
