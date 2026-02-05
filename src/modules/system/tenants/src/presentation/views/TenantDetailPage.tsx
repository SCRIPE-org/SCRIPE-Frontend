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
                              // Enter tenant world context
                              enterTenantWorld({
                                    id: result.id,
                                    name: result.name,
                                    parentId: result.parentId,
                              });
                              // Set API context header via Repository (Clean Architecture)
                              tenantRepository.setTenantContext(result.id);
                        } else {
                              setError(t("tenant.notFound") || "Tenant not found");
                        }
                  } catch (err) {
                        console.error("Failed to fetch tenant:", err);
                        setError(t("common.errorLoading") || "Failed to load tenant");
                  } finally {
                        setLoading(false);
                  }
            }

            fetchTenant();

            // Cleanup on unmount
            return () => {
                  exitTenantWorld();
                  tenantRepository.setTenantContext(null);
            };
      }, [tenantId, enterTenantWorld, exitTenantWorld, tenantRepository, t]);

      // Handle back navigation
      const handleBack = () => {
            exitTenantWorld();
            tenantRepository.setTenantContext(null);
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div
                        className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
                        dir={direction}
                  >
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
                  <PageBreadcrumbs
                        segments={breadcrumbSegments}
                  />

                  {/* Header with Tenant Info */}
                  <TenantHeader
                        tenant={tenant}
                        onUpdate={() => {
                              // Refetch tenant after update
                              systemContainer.tenantRepository.getById(tenantId).then(setTenant);
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
