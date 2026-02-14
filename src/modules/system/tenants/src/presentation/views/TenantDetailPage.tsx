/**
 * Tenant Detail Page
 *
 * Main container component for the "Tenant World" experience.
 * A full-page dashboard for managing a single tenant's resources.
 *
 * @module tenants
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/system/di";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { Skeleton } from "@core/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { Button } from "@core/ui/button";
import type { Tenant } from "../../domain/entities/Tenant";
import { TenantHeader } from "../components/TenantHeader";
import { TenantStats } from "../components/TenantStats";
import { TenantTabs } from "../components/TenantTabs";
import { appLogger } from "@/core/common/logger";

interface TenantDetailPageProps {
  tenantId: string;
}

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const router = useRouter();
  const { t, direction } = useI18n();
  const { enterTenantWorld, exitTenantWorld, breadcrumbs } = useTenantContext();
  const { tenantRepository } = systemContainer;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant details on mount
  useEffect(() => {
    async function fetchTenant() {
      try {
        setLoading(true);
        setError(null);
        const result = await tenantRepository.getById(tenantId);
        if (result) {
          setTenant(result);
          // DO NOT auto-enter tenant world here.
          // "View Details" should be distinct from "Drill Down" (Context Switch).

          // However, for API calls in the tabs to work without Drill Down,
          // we might need to rely on the ID passed to components,
          // NOT the global header which is for "Drill Down" mode.
        } else {
          setError(t("tenant.notFound") || "Tenant not found");
        }
      } catch (err) {
        appLogger.error("Failed to fetch tenant:", err);
        setError(t("common.errorLoading") || "Failed to load tenant");
      } finally {
        setLoading(false);
      }
    }

    fetchTenant();

    // Cleanup on unmount
    return () => {
      // No need to exit world if we didn't enter it automatically.
      // If user manually enters, they should manually exit or navigate away.
      // However, if we set any temporary context, clear it here.
      // tenantRepository.setTenantContext(null);
    };
  }, [tenantId, enterTenantWorld, exitTenantWorld, tenantRepository, t]);

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
          // Refetch tenant after update
          systemContainer.tenantRepository.getById(tenantId).then(setTenant);
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
