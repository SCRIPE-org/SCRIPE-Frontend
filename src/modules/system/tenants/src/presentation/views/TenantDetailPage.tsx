/**
 * Tenant Detail Page
 *
 * Main container component for the "Tenant World" experience.
 * A full-page dashboard for managing a single tenant's resources.
 *
 * @module tenants
 */
"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@core/ui/button";

// Lazy-load heavy sub-sections (below loading skeleton)
const TenantHeader = dynamic(() => import("../components/TenantHeader").then(m => ({ default: m.TenantHeader })), { ssr: false });
const TenantStats = dynamic(() => import("../components/TenantStats").then(m => ({ default: m.TenantStats })), { ssr: false });
const TenantTabs = dynamic(() => import("../components/TenantTabs").then(m => ({ default: m.TenantTabs })), { ssr: false });

interface TenantDetailPageProps {
  tenantId: string;
}

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const router = useRouter();
  const { t, direction } = useI18n();
  const { enterTenantWorld } = useTenantContext();
  const queryClient = useQueryClient();

  // Use TanStack Query for tenant data — enables proper cache invalidation
  const {
    data: tenant,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => systemContainer.tenantRepository.getById(tenantId),
    enabled: !!tenantId,
  });

  const error = queryError ? (queryError as Error).message : (!loading && !tenant ? (t("tenant.notFound") || "Tenant not found") : null);

  // Handle back navigation
  const handleBack = () => {
    router.push("/tenants");
  };

  // Build breadcrumb segments for PageBreadcrumbs
  const breadcrumbSegments = [
    { label: t("nav.tenants") || "Tenants", href: "/tenants" },
    ...(tenant ? [{ label: tenant.name }] : []),
  ];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 p-6" dir={direction}>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error || !tenant) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" dir={direction}>
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">{error || t("tenant.notFound")}</h2>
        <p className="text-muted-foreground">{t("tenant.errorLoadingDetails")}</p>
        <Button onClick={handleBack} variant="outline">
          {t("tenant.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen space-y-6" dir={direction}>
      {/* Breadcrumbs with Back Button */}
      <PageBreadcrumbs segments={breadcrumbSegments} />

      {/* Header with Tenant Info */}
      <TenantHeader
        tenant={tenant}
        onUpdate={() => {
          // Invalidate the cache so TanStack Query refetches automatically
          queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] });
        }}
        onEnter={() => {
          enterTenantWorld({
            id: tenant.id,
            name: tenant.name,
            parentId: tenant.parentId,
          });
          router.push("/");
        }}
      />

      {/* Stats Cards */}
      <TenantStats tenantId={tenantId} />

      {/* Tabbed Content */}
      <TenantTabs
        tenantId={tenantId}
        tenantName={tenant.name}
        tenantCode={tenant.code}
        parentTenantId={tenant.parentId}
      />
    </main>
  );
}

