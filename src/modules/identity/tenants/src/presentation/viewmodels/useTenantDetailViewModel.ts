"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";
import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";

interface UseTenantDetailViewModelProps {
  tenantId: string;
}

/**
 * React hook/ViewModel orchestrating state and data flows for tenant detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantDetailViewModel({ tenantId }: UseTenantDetailViewModelProps) {
  const router = useRouter();
  const { t, direction } = useI18n();
  const { enterTenantWorld } = useTenantContext();
  const queryClient = useQueryClient();

  const {
    data: tenant,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => identityContainer.tenantRepository.getById(tenantId),
    enabled: !!tenantId,
  });

  useBreadcrumbOverride(tenant?.name);

  const error = queryError
    ? (queryError as Error).message
    : !loading && !tenant
      ? t("tenant.notFound") || "Tenant not found"
      : null;

  const handleBack = () => {
    router.push("/tenants");
  };

  const handleUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
  };

  const handleEnter = () => {
    if (!tenant) return;
    enterTenantWorld({
      id: tenant.id,
      name: tenant.name,
      parentId: tenant.parentId,
    });
    router.push("/");
  };

  const breadcrumbSegments = [
    { label: t("nav.tenants") || "Tenants", href: "/tenants" },
    ...(tenant ? [{ label: tenant.name }] : []),
  ];

  return {
    tenant,
    loading,
    error,
    direction,
    handleBack,
    handleUpdate,
    handleEnter,
    breadcrumbSegments,
  };
}
